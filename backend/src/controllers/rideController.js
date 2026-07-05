const Ride = require("../model/Ride");
const User = require("../model/User");
const Driver = require("../model/Driver");
const calculateFare = require("../utils/fareCalculator");
const { connectedUsers } = require("../sockets/socketHandler");
const createNotification = require("../utils/createNotification");
const { getDistanceAndDuration } = require("../services/osrmService");

const requestRide = async (req, res) => {
  try {
    const { pickup, destination } = req.body;

    console.log("\n========== NEW RIDE REQUEST ==========");

    // ==========================
    // Get Rider
    // ==========================
    const mongoUser = await User.findOne({
      firebaseUid: req.user.uid,
    }).lean();

    if (!mongoUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("Rider:", mongoUser._id.toString());

    // ==========================
    // Create Ride
    // ==========================
    const ride = await Ride.create({
      riderId: mongoUser._id,
      pickup,
      destination,
      status: "pending",
    });

    console.log("Ride Created:", ride._id.toString());

    // ==========================
    // Find Nearby Drivers
    // ==========================
    const nearbyDrivers = await Driver.find({
      isAvailable: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [pickup.lng, pickup.lat],
          },
          $maxDistance: 500,
        },
      },
    }).lean();

    console.log("Drivers Found:", nearbyDrivers.length);

    const io = req.app.get("io");

    // ==========================
    // Notify Nearby Drivers
    // ==========================
    for (const driver of nearbyDrivers) {
      const socketId =
        connectedUsers[driver.userId.toString()];

      await createNotification(
        driver.userId,
        "New Ride Request",
        "A rider nearby needs a ride."
      );

      if (socketId) {
        io.to(socketId).emit("new-ride", {
          rideId: ride._id,
          pickup,
          destination,
        });

        console.log(
          `Ride sent to Driver ${driver.userId}`
        );
      }
    }

    // ==========================
    // Auto Cancel after 30 sec
    // ==========================
    setTimeout(async () => {
      try {
        const currentRide =
          await Ride.findById(ride._id);

        if (
          currentRide &&
          currentRide.status === "pending"
        ) {
          currentRide.status = "cancelled";

          await currentRide.save();

          console.log(
            `Ride ${ride._id} auto-cancelled`
          );

          io.emit("ride-removed", {
            rideId: ride._id,
          });
        }
      } catch (err) {
        console.error(
          "AUTO CANCEL ERROR:",
          err
        );
      }
    }, 30000);

    // ==========================
    // Response
    // ==========================
    return res.status(201).json({
      success: true,
      message: "Ride requested successfully",
      ride,
      nearbyDrivers,
    });
  } catch (error) {
    console.error(
      "REQUEST RIDE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



const acceptRide = async (req, res) => {
  try {
    // ==========================
    // Get Current User
    // ==========================
    const user = await User.findOne({
      firebaseUid: req.user.uid,
    }).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ==========================
    // Get Driver (NO .lean())
    // ==========================
    const driver = await Driver.findOne({
      userId: user._id,
    }).populate("userId");

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    // ==========================
    // Check Active Ride
    // ==========================
    const activeRide = await Ride.findOne({
      driverId: driver.userId._id,
      status: {
        $in: ["accepted", "arriving", "in_progress"],
      },
      _id: {
        $ne: req.params.id,
      },
    }).lean();

    if (activeRide) {
      return res.status(400).json({
        success: false,
        message: "Driver already has an active ride",
      });
    }

    // ==========================
    // Accept Ride
    // ==========================
    const ride = await Ride.findOneAndUpdate(
      {
        _id: req.params.id,
        status: "pending",
      },
      {
        $set: {
          driverId: driver.userId._id,
          status: "accepted",
        },
      },
      {
        new: true,
      },
    );

    if (!ride) {
      return res.status(400).json({
        success: false,
        message: "Ride is no longer available",
      });
    }

    // ==========================
    // Driver Becomes Busy
    // ==========================
    driver.isAvailable = false;
    await driver.save();

    // ==========================
    // Notification
    // ==========================
    await createNotification(
      ride.riderId,
      "Ride Accepted",
      "Your ride has been accepted.",
    );

    const io = req.app.get("io");

    const riderSocketId = connectedUsers[ride.riderId.toString()];

    const driverSocketId = connectedUsers[driver.userId._id.toString()];

    // ==========================
    // Join Driver Room
    // ==========================
    if (driverSocketId) {
      const driverSocket = io.sockets.sockets.get(driverSocketId);

      if (driverSocket) {
        driverSocket.join(ride._id.toString());
      }
    }

    // ==========================
    // Join Rider Room
    // ==========================
    if (riderSocketId) {
      const riderSocket = io.sockets.sockets.get(riderSocketId);

      if (riderSocket) {
        riderSocket.join(ride._id.toString());

        riderSocket.emit("ride-accepted", {
          rideId: ride._id,
          status: "accepted",
          pickup: ride.pickup,
          destination: ride.destination,

          driver: {
            id: driver.userId._id,
            name: driver.userId.name,
            email: driver.userId.email,
            phone: driver.userId.phone,
            rating: driver.rating,
            vehicleType: driver.vehicleType,
            vehicleNumber: driver.vehicleNumber,
          },
        });
      }
    }

    // ==========================
    // Remove Ride Popup
    // ==========================
    io.emit("ride-removed", {
      rideId: ride._id,
    });

    // ==========================
    // Response
    // ==========================
    return res.status(200).json({
      success: true,
      message: "Ride accepted successfully",

      ride,

      driver: {
        id: driver.userId._id,
        name: driver.userId.name,
        email: driver.userId.email,
        phone: driver.userId.phone,
        rating: driver.rating,
        vehicleType: driver.vehicleType,
        vehicleNumber: driver.vehicleNumber,
      },
    });
  } catch (error) {
    console.error("ACCEPT RIDE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getRiderStats = async (req, res) => {
  try {
    const user = await User.findOne({
      firebaseUid: req.user.uid,
    }).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const rides = await Ride.find({
      riderId: user._id,
    }).lean();

    const totalRides = rides.length;

    const completedRides = rides.filter((ride) => ride.status === "completed");

    const cancelledRides = rides.filter((ride) => ride.status === "cancelled");

    const totalSpent = completedRides.reduce(
      (sum, ride) => sum + (ride.fare || 0),
      0,
    );

    const totalDistance = completedRides.reduce(
      (sum, ride) => sum + (ride.distance || 0),
      0,
    );

    const totalDuration = completedRides.reduce(
      (sum, ride) => sum + (ride.duration || 0),
      0,
    );

    const averageFare =
      completedRides.length > 0
        ? Number((totalSpent / completedRides.length).toFixed(2))
        : 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalRides,
        completedRides: completedRides.length,
        cancelledRides: cancelledRides.length,
        totalSpent,
        totalDistance,
        totalDuration,
        averageFare,
      },
    });
  } catch (error) {
    console.error("GET RIDER STATS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const startRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }

    if (ride.status !== "accepted") {
      return res.status(400).json({
        success: false,
        message: "Only accepted rides can be started",
      });
    }

    ride.status = "in_progress";

    await ride.save();

    await createNotification(
      ride.riderId,
      "Ride Started",
      "Your trip is now in progress."
    );

    const io = req.app.get("io");

    io.to(ride._id.toString()).emit("ride-started", {
      rideId: ride._id,
      status: ride.status,
    });

    return res.status(200).json({
      success: true,
      message: "Ride started successfully",
      ride,
    });
  } catch (error) {
    console.error("START RIDE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const completeRide = async (req, res) => {
  try {
    // ==========================
    // Find Ride
    // ==========================
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }

    if (ride.status !== "in_progress") {
      return res.status(400).json({
        success: false,
        message: "Only in-progress rides can be completed",
      });
    }

    // ==========================
    // Calculate Distance & Duration
    // ==========================
    const { distance, duration } =
      await getDistanceAndDuration(
        ride.pickup,
        ride.destination
      );

    ride.distance = distance;
    ride.duration = duration;
    ride.fare = calculateFare(distance);
    ride.status = "completed";

    await ride.save();

    // ==========================
    // Notify Rider
    // ==========================
    await createNotification(
      ride.riderId,
      "Ride Completed",
      `Trip completed. Fare: ₹${ride.fare}`
    );

    // ==========================
    // Driver Available Again
    // ==========================
    const driver = await Driver.findOne({
      userId: ride.driverId,
    });

    if (driver) {
      driver.isAvailable = true;
      await driver.save();
    }

    // ==========================
    // Socket Event
    // ==========================
    const io = req.app.get("io");

    io.to(ride._id.toString()).emit("ride-completed", {
      rideId: ride._id,
      fare: ride.fare,
      distance: ride.distance,
      duration: ride.duration,
      status: ride.status,
    });

    // ==========================
    // Response
    // ==========================
    return res.status(200).json({
      success: true,
      message: "Ride completed successfully",
      fare: ride.fare,
      distance: ride.distance,
      duration: ride.duration,
      ride,
    });
  } catch (error) {
    console.error("COMPLETE RIDE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyRides = async (req, res) => {
  try {
    const user = await User.findOne({
      firebaseUid: req.user.uid,
    }).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const rides = await Ride.find({
      riderId: user._id,
    })
      .populate({
        path: "driverId",
        select: "name email phone",
      })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: rides.length,
      rides,
    });
  } catch (error) {
    console.error("GET MY RIDES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getDriverRides = async (req, res) => {
  try {
    const user = await User.findOne({
      firebaseUid: req.user.uid,
    }).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const rides = await Ride.find({
      driverId: user._id,
    })
      .populate({
        path: "riderId",
        select: "name email phone",
      })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: rides.length,
      rides,
    });
  } catch (error) {
    console.error("GET DRIVER RIDES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getRideLocation = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id).lean();

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }

    return res.status(200).json({
      success: true,
      location: {
        lat: ride.currentLocation?.lat,
        lng: ride.currentLocation?.lng,
      },
      updatedAt: ride.updatedAt,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const cancelRide = async (req, res) => {
  try {
    // ==========================
    // Current User
    // ==========================
    const user = await User.findOne({
      firebaseUid: req.user.uid,
    }).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ==========================
    // Find Ride (NO .lean())
    // ==========================
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }

    // ==========================
    // Authorization
    // ==========================
    const isRider =
      ride.riderId.toString() === user._id.toString();

    const isDriver =
      ride.driverId &&
      ride.driverId.toString() === user._id.toString();

    if (!isRider && !isDriver) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // ==========================
    // Ride Status Validation
    // ==========================
    if (
      ride.status === "completed" ||
      ride.status === "cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message: `Ride already ${ride.status}`,
      });
    }

    // Optional: Prevent cancelling after ride starts
    if (ride.status === "in_progress") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a ride that is already in progress",
      });
    }

    // ==========================
    // Cancel Ride
    // ==========================
    ride.status = "cancelled";
    await ride.save();

    // ==========================
    // Driver Available Again
    // ==========================
    if (ride.driverId) {
      const driver = await Driver.findOne({
        userId: ride.driverId,
      });

      if (driver) {
        driver.isAvailable = true;
        await driver.save();
      }
    }

    // ==========================
    // Notification
    // ==========================
    await createNotification(
      ride.riderId,
      "Ride Cancelled",
      "Your ride has been cancelled."
    ).lean();

    // ==========================
    // Socket Event
    // ==========================
    const io = req.app.get("io");

    io.to(ride._id.toString()).emit("ride-cancelled", {
      rideId: ride._id,
      status: ride.status,
    });

    // ==========================
    // Response
    // ==========================
    return res.status(200).json({
      success: true,
      message: "Ride cancelled successfully",
      ride,
    });
  } catch (error) {
    console.error("CANCEL RIDE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  requestRide,
  acceptRide,
  startRide,
  completeRide,
  cancelRide,
  getMyRides,
  getDriverRides,
  getRideLocation,
  getRiderStats,
};
