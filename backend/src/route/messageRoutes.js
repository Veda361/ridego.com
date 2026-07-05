const express = require("express");

const router = express.Router();

const protect = require("../middlewares/authMiddleware");

const {
  getRideMessages,
} = require("../controllers/messageController");

router.get("/:rideId", protect, getRideMessages);

module.exports = router;