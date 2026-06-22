const mongoose = require("mongoose");
const razorpay = require("../config/razorpay");

const paymentSchema = new mongoose.Schema({
    rideId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ride",
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    razorpayOrderId: String,

    razorpayPaymentId: String,

    amount: Number,

    status: {
        type: String,
        enum: [
            "created",
            "paid",
            "failed",
        ],
        default: "created",
    },
    },
    {
    timeStamp: true,
    }
);


module.exports = mongoose.Schema(
    "payment",
    paymentSchema 
)