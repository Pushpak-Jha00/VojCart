import { Server } from "socket.io";
import { allowedOrigins } from "../middleware/origin.middleware.js";

let io = null;

export const initializeSocket = (httpServer) => {
  // Prevent multiple Socket.IO instances
  if (io) {
    return io;
  }

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Allow requests without an Origin header
        if (!origin) {
          return callback(null, true);
        }

        const normalizedOrigin = origin.replace(/\/$/, "");

        if (allowedOrigins.includes(normalizedOrigin)) {
          return callback(null, true);
        }

        return callback(new Error("Socket.IO: Origin not allowed"));
      },
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("disconnect", () => {});
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized");
  }

  return io;
};
