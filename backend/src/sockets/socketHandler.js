const Ride = require("../model/Ride");
const Message = require("../model/Message");
const Driver = require("../model/Driver");

const connectedUsers = {};

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("\n========================================");
    console.log("🔌 New Socket Connected");
    console.log("Socket ID:", socket.id);
    console.log("========================================");

    /*
    ==================================
    Register User
    ==================================
    */

    socket.on("register-user", (userId) => {
      console.log("\n========== REGISTER USER ==========");

      if (!userId) {
        console.log("❌ register-user called without userId");
        return;
      }

      console.log("User ID :", userId);
      console.log("Socket  :", socket.id);

      connectedUsers[userId] = socket.id;

      socket.userId = userId;

      console.log("Current Connected Users");

      console.table(connectedUsers);

      socket.emit("registration-success", {
        success: true,
        userId,
        socketId: socket.id,
      });

      console.log(`✅ User Registered -> ${userId} (${socket.id})`);

      console.log("====================================\n");
    });

    /*
    ==================================
    Join Ride Room
    ==================================
    */
    socket.on("join-ride", (rideId) => {
      try {
        if (!rideId) {
          console.log("❌ join-ride received empty rideId");
          return;
        }

        socket.join(rideId);

        console.log("================================");
        console.log("🚕 Joined Ride Room");
        console.log("Ride :", rideId);
        console.log("Socket :", socket.id);
        console.log("================================");

        socket.emit("joined-ride", {
          success: true,
          rideId,
        });
      } catch (err) {
        console.log(err);
      }
    });

    /*
==================================
Leave Ride Room
==================================
*/
    socket.on("leave-ride", (rideId) => {
      socket.leave(rideId);

      console.log(`🚪 ${socket.id} left Ride Room ${rideId}`);
    });

    /*
==================================
Driver Live Location
==================================
*/
    socket.on("driver-location", async (data) => {
      try {
        const { rideId, lat, lng } = data;

        if (!rideId) {
          console.log("❌ rideId missing");
          return;
        }

        if (lat == null || lng == null) {
          console.log("❌ Invalid coordinates");
          return;
        }

        console.log("\n================================");
        console.log("📍 DRIVER LOCATION UPDATE");
        console.log("Ride :", rideId);
        console.log("Driver :", socket.userId);
        console.log("Lat :", lat);
        console.log("Lng :", lng);
        console.log("================================");

        /*
    ==================================
    Update Ride Live Location
    ==================================
    */

        await Ride.findByIdAndUpdate(
          rideId,
          {
            currentLocation: {
              lat,
              lng,
            },
          },
          {
            new: true,
          },
        );

        /*
    ==================================
    Update Driver GPS
    ==================================
    */

        await Driver.findOneAndUpdate(
          {
            userId: socket.userId,
          },
          {
            location: {
              type: "Point",
              coordinates: [lng, lat],
            },
          },
          {
            new: true,
          },
        );

        /*
    ==================================
    Broadcast To Rider
    ==================================
    */

        io.to(rideId).emit("driver-location", {
          rideId,
          lat,
          lng,
          updatedAt: new Date(),
        });

        console.log("✅ Ride Location Updated");
        console.log("✅ Driver GPS Updated");
        console.log("✅ Broadcast Sent");
      } catch (err) {
        console.error("❌ Driver Location Error");
        console.error(err);
      }
    });
    /*
    ==================================
    Ride Accepted
    ==================================
    */

    socket.on("ride-accepted", (data) => {
      console.log("✅ Ride Accepted Event:", data);

      io.to(data.rideId).emit("ride-accepted", data);
    });

    /*
    ==================================
    Ride Started
    ==================================
    */

    socket.on("ride-started", (rideId) => {
      console.log(`🚀 Ride Started ${rideId}`);

      io.to(rideId).emit("ride-started", {
        rideId,
      });
    });

    /*
    ==================================
    Ride Completed
    ==================================
    */

    socket.on("ride-completed", ({ rideId, fare }) => {
      console.log(`✅ Ride Completed ${rideId}`);

      io.to(rideId).emit("ride-completed", {
        rideId,
        fare,
      });
    });

    /*
    ==================================
    Ride Cancelled
    ==================================
    */

    socket.on("ride-cancelled", (rideId) => {
      console.log(`❌ Ride Cancelled ${rideId}`);

      io.to(rideId).emit("ride-cancelled", {
        rideId,
      });
    });

    /*
    ==================================
    Remove Ride From Drivers
    ==================================
    */

    socket.on("ride-removed", (rideId) => {
      console.log(`🚫 Removing Ride ${rideId} from all drivers`);

      io.emit("ride-removed", {
        rideId,
      });
    });
    /*
==================================
Ride Chat
==================================
*/

    socket.on("send-message", async (data) => {
      try {
        const { rideId, text } = data;

        if (!rideId || !text?.trim()) {
          return;
        }

        console.log("\n💬 NEW MESSAGE");
        console.log("Ride :", rideId);
        console.log("Sender :", socket.userId);

        const message = await Message.create({
          rideId,
          senderId: socket.userId,
          text,
        });

        io.to(rideId).emit("receive-message", {
          _id: message._id,
          rideId,
          sender: socket.userId,
          text: message.text,
          createdAt: message.createdAt,
        });

        console.log("Message Saved");
      } catch (err) {
        console.error("Chat Error");

        console.error(err);
      }
    });

    /*
    ==================================
    Disconnect
    ==================================
    */

    socket.on("disconnect", () => {
      console.log("\n========== DISCONNECT ==========");

      console.log("Socket:", socket.id);

      if (socket.userId) {
        delete connectedUsers[socket.userId];

        console.log(`🗑 Removed User: ${socket.userId}`);
      }

      console.log("Remaining Connected Users");

      console.table(connectedUsers);

      console.log("================================\n");
    });
  });
};

/*
==================================
Helper Functions
==================================
*/
/*
==================================
Helper Functions
==================================
*/

/**
 * Returns socket id of a connected user.
 */
const getSocketId = (userId) => {
  if (!userId) return null;

  return connectedUsers[userId] || null;
};

/**
 * Emit an event to one specific user.
 */
const emitToUser = (io, userId, event, data = {}) => {
  try {
    const socketId = getSocketId(userId);

    if (!socketId) {
      console.log(`⚠️ User ${userId} is offline. Event "${event}" not sent.`);
      return false;
    }

    io.to(socketId).emit(event, data);

    console.log(`📤 Event "${event}" sent to User ${userId}`);

    return true;
  } catch (err) {
    console.error("EmitToUser Error:");

    console.error(err);

    return false;
  }
};

/**
 * Broadcast ride removal to every connected driver.
 */
const broadcastRideRemoved = (io, rideId) => {
  try {
    io.emit("ride-removed", {
      rideId,
    });

    console.log(`🚫 Ride ${rideId} removed from all connected drivers`);
  } catch (err) {
    console.error("Broadcast Ride Removed Error:");

    console.error(err);
  }
};

/**
 * Print all connected users.
 * Useful while debugging.
 */
const printConnectedUsers = () => {
  console.log("\n========== CONNECTED USERS ==========");

  if (Object.keys(connectedUsers).length === 0) {
    console.log("No users connected.");
  } else {
    console.table(connectedUsers);
  }

  console.log("=====================================\n");
};

/*
==================================
Ride Chat
==================================
*/

module.exports = {
  socketHandler,
  connectedUsers,
  getSocketId,
  emitToUser,
  broadcastRideRemoved,
  printConnectedUsers,
};
