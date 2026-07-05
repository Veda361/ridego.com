const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        firebaseUid: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },

        role: {
            type: String,
            enum: ["rider", "driver", "admin"],
            default: "rider",
            //user--->rider
            required: true,
        },

        isOnline: {
            type: Boolean,
            default: false,
        },

        phone: {
            type: String,
            default:"",
        },
        
    },
    {
        timestamps: true,
    },
        
);

module.exports = mongoose.model("User", userSchema);