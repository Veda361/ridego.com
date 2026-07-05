const User = require("../model/User");

const Driver = require("../model/Driver");

const Ride = require("../model/Ride");

const Payment = require("../model/Payment");

const getRevenue = async (match = {}) => {
  const revenue = await Payment.aggregate([
    {
      $match: {
        status: "paid",
        ...match,
      },
    },
    {
      $group: {
        _id: null,
        total: {
          $sum: "$amount",
        },
      },
    },
  ]);

  return revenue[0]?.total || 0;
};

const getAdminStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const monthStart = new Date();
    monthStart.setMonth(monthStart.getMonth() - 1);

    const [
      // Platform
      totalUsers,
      totalDrivers,
      availableDrivers,
      totalRiders,
      totalAdmins,
      onlineUsers,
      offlineUsers,
      onlineDrivers,

      // Ride Stats
      totalRides,
      completedRides,
      cancelledRides,

      // Payment Stats
      totalPayments,
      createdPayments,
      paidPayments,
      failedPayments,

      // Revenue
      totalRevenues,
      todayRevenue,
      weeklyRevenue,
      monthlyRevenue,
    ] = await Promise.all([
      // Platform
      User.countDocuments(),
      Driver.countDocuments(),
      Driver.countDocuments({ isAvailable: true }),

      User.countDocuments({ role: "rider" }),
      User.countDocuments({ role: "admin" }),

      User.countDocuments({ isOnline: true }),
      User.countDocuments({ isOnline: false }),

      User.countDocuments({
        role: "driver",
        isOnline: true,
      }),

      // Ride Stats
      Ride.countDocuments(),
      Ride.countDocuments({
        status: "completed",
      }),
      Ride.countDocuments({
        status: "cancelled",
      }),

      // Payment Stats
      Payment.countDocuments(),

      Payment.countDocuments({
        status: "created",
      }),

      Payment.countDocuments({
        status: "paid",
      }),

      Payment.countDocuments({
        status: "failed",
      }),

      // Revenue
      getRevenue(),

      getRevenue({
        createdAt: {
          $gte: today,
        },
      }),

      getRevenue({
        createdAt: {
          $gte: weekStart,
        },
      }),

      getRevenue({
        createdAt: {
          $gte: monthStart,
        },
      }),
    ]);

    const busyDrivers = onlineDrivers - availableDrivers;

    const offlineDrivers = totalDrivers - onlineDrivers;

    const paymentSuccessRate =
      totalPayments > 0
        ? Number(((paidPayments / totalPayments) * 100).toFixed(2))
        : 0;

    return res.status(200).json({
      success: true,

      // Platform
      totalUsers,
      totalDrivers,
      totalRiders,
      totalAdmins,

      onlineUsers,
      offlineUsers,

      onlineDrivers,
      availableDrivers,
      busyDrivers,
      offlineDrivers,

      // Old field (Frontend compatibility)
      activeDrivers: availableDrivers,

      // Ride Stats
      totalRides,
      completedRides,
      cancelledRides,

      // Payment Stats
      totalPayments,
      createdPayments,
      paidPayments,
      failedPayments,

      // Revenue
      totalRevenues,
      todayRevenue,
      weeklyRevenue,
      monthlyRevenue,

      // Analytics
      paymentSuccessRate,
    });
  } catch (error) {
    console.error("GET ADMIN STATS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("GET ALL USERS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const [
      totalRides,
      completedRides,
      cancelledRides,
      pendingRides,
      recentRides,
      payments,
    ] = await Promise.all([
      Ride.countDocuments({
        riderId: user._id,
      }),

      Ride.countDocuments({
        riderId: user._id,
        status: "completed",
      }),

      Ride.countDocuments({
        riderId: user._id,
        status: "cancelled",
      }),

      Ride.countDocuments({
        riderId: user._id,
        status: "pending",
      }),

      Ride.find({
        riderId: user._id,
      })
        .populate("driverId")
        .sort({
          createdAt: -1,
        })
        .limit(10)
        .lean(),

      Payment.find({
        userId: user._id,
      })
        .populate("rideId")
        .sort({
          createdAt: -1,
        })
        .limit(10)
        .lean(),
    ]);

    const totalSpent = payments
      .filter(
        (payment) => payment.status === "paid"
      )
      .reduce(
        (sum, payment) =>
          sum + payment.amount,
        0
      );

    return res.status(200).json({
      success: true,

      user,

      stats: {
        totalRides,
        completedRides,
        cancelledRides,
        pendingRides,
        totalSpent,
      },

      recentRides,

      payments,
    });
  } catch (error) {
    console.error(
      "GET USER BY ID ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find()
      .populate("userId")
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: drivers.length,
      drivers,
    });
  } catch (error) {
    console.error("GET ALL DRIVERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllRides = async (req, res) => {
  try {
    const rides = await Ride.find()
      .populate("riderId")
      .populate("driverId")
      .sort({
        createdAt: -1,
      })
      .lean();
    return res.json({
      success: true,
      count: rides.length,
      rides,
    });
  } catch (error) {
    console.error("GET ALL RIDES ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("userId")
      .populate("rideId")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error("GET ALL PAYMENTS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getRevenue,
  getAdminStats,
  getAllUsers,
  getUserById,
  getAllDrivers,
  getAllRides,
  getAllPayments,
};
