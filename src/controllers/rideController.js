const Ride = require("../model/Ride");
const User = require("../model/User");
const Driver = require("../model/Driver");
const calculateFare = require("../utils/fareCalculator");

const requestRide = async (req, res) => {
  try {
    const { pickup, destination } = req.body;

    const mongoUser = await User.findOne({
      firebaseUid: req.user.uid,
    });

    if (!mongoUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const ride = await Ride.create({
      riderId: mongoUser._id,
      pickup,
      destination,
      status: "pending",
    });

    const nearbyDrivers = await Driver.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [
              pickup.lng,
              pickup.lat,
            ],
          },
          $maxDistance: 5000,
        },
      },
    });

    res.status(201).json({
      success: true,
      ride,
      nearbyDrivers,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const acceptRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        message: "Ride not found",
      });
    }

    const user = await User.findOne({
      firebaseUid: req.user.uid,
    });

    const driver = await Driver.findOne({
      userId: user._id,
    });

    if (!driver) {
      return res.status(404).json({
        message: "Driver not found",
      });
    }

    ride.driverId = driver.userId;
    ride.status = "accepted";

    await ride.save();

    res.json({
      success: true,
      ride,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const startRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        message: "Ride not found",
      });
    }

    ride.status = "in_progress";

    await ride.save();

    res.json({
      success: true,
      ride,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const completeRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        message: "Ride not found",
      });
    }

    // Temporary distance in KM
    // Later replace with Google Maps API distance
    const distance = 8;

    ride.fare = calculateFare(distance);
    ride.status = "completed";

    await ride.save();

    res.json({
      success: true,
      fare: ride.fare,
      ride,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  requestRide,
  acceptRide,
  startRide,
  completeRide,
};