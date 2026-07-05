const express = require("express");

const router = express.Router();

const protect = require("../middlewares/authMiddleware");

const isAdmin = require("../middlewares/adminMiddleware");

const {
    getAdminStats, 
    getAllUsers,
    getUserById,
    getAllDrivers,
    getAllRides,
    getAllPayments    
} = require("../controllers/adminController");


router.get("/stats", protect, isAdmin, getAdminStats);

router.get("/users", protect, isAdmin, getAllUsers);

router.get("/drivers", protect, isAdmin, getAllDrivers);

router.get("/rides", protect, isAdmin, getAllRides);

router.get("/payments", protect, isAdmin, getAllPayments);

router.get("/users/:id", protect, isAdmin, getUserById);

module.exports = router;

