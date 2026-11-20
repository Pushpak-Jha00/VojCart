import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { initializeSocket } from "./socket/socket.js";

import connectDB from "./config/db.js";

import { notFound, errorHandler } from "./middleware/error.middleware.js";

import originProtection, {
  allowedOrigins,
} from "./middleware/origin.middleware.js";

import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import menuRoutes from "./routes/menu.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

// Load environment variables
dotenv.config();

const app = express();

// ==========================================
// Security Middleware
// ==========================================

app.use(helmet());

// ==========================================
// CORS Configuration
// ==========================================

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests from non-browser clients
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/$/, "");

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },

    credentials: true,

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ==========================================
// Origin Protection
// ==========================================

app.use(originProtection);

// ==========================================
// Performance Middleware
// ==========================================

app.use(compression());

// ==========================================
// Request Parsing
// ==========================================

app.use(
  express.json({
    limit: "1mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  }),
);

// ==========================================
// Cookie Parser
// ==========================================

app.use(cookieParser());

// ==========================================
// API Rate Limiting
// ==========================================

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  limit: 200,

  standardHeaders: "draft-8",

  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api", apiLimiter);

// ==========================================
// API Routes
// ==========================================

app.use("/api/auth", authRoutes);

app.use("/api/products", productRoutes);

app.use("/api/categories", categoryRoutes);

app.use("/api/menu", menuRoutes);

app.use("/api/dashboard", dashboardRoutes);

// ==========================================
// 404 Handler
// ==========================================

app.use(notFound);

// ==========================================
// Global Error Handler
// ==========================================

app.use(errorHandler);

// ==========================================
// Start Server
// ==========================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const httpServer = createServer(app);

    initializeSocket(httpServer);

    httpServer.listen(PORT, () => {});
  } catch (error) {
    process.exit(1);
  }
};

startServer();
