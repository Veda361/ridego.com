import { io } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

console.log("=================================");
console.log("Socket URL:", SOCKET_URL);
console.log("=================================");

export const socket = io(SOCKET_URL, {
  autoConnect: false,

  transports: ["websocket", "polling"],

  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,

  timeout: 10000,
});

/*
=========================================
Socket Debug Logs
=========================================
*/

socket.on("connect", () => {
  console.log("🟢 SOCKET CONNECTED");
  console.log("Socket ID:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("🔴 SOCKET DISCONNECTED");
  console.log(reason);
});

socket.on("connect_error", (err) => {
  console.log("❌ SOCKET CONNECT ERROR");
  console.error(err);
});

socket.on("error", (err) => {
  console.log("❌ SOCKET ERROR");
  console.error(err);
});

socket.on("reconnect_attempt", (attempt) => {
  console.log(`🔄 Reconnect Attempt #${attempt}`);
});

/*
=========================================
Connect Helper
=========================================
*/

export function connectSocket() {
  if (!socket.connected) {
    console.log("Connecting Socket...");
    socket.connect();
  }

  return socket;
}

/*
=========================================
Register User
=========================================
*/

export function registerSocketUser(userId) {
  if (!userId) {
    console.log("No Mongo User ID found");
    return () => {};
  }

  const register = () => {
    console.log("Registering Socket User:", userId);

    socket.emit("register-user", userId);
  };

  if (!socket.connected) {
    socket.connect();
  }

  if (socket.connected) {
    register();
  }

  socket.on("connect", register);

  return () => {
    socket.off("connect", register);
  };
}

/*
=========================================
Bind Events
=========================================
*/

export function bindSocketEvents(events) {
  Object.entries(events).forEach(([event, handler]) => {
    socket.on(event, handler);
  });

  return () => {
    Object.entries(events).forEach(([event, handler]) => {
      socket.off(event, handler);
    });
  };
}