import "dotenv/config";

import ApiError from "../utils/ApiError.js";

export const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

const originProtection = (req, res, next) => {
  const safeMethods = ["GET", "HEAD", "OPTIONS"];

  if (safeMethods.includes(req.method)) {
    return next();
  }

  const origin = req.get("Origin");

  // Allow non-browser clients such as Postman.
  if (!origin) {
    return next();
  }

  const normalizedOrigin = origin.replace(/\/$/, "");

  if (!allowedOrigins.includes(normalizedOrigin)) {
    return next(new ApiError(403, "Request origin is not allowed"));
  }

  next();
};

export default originProtection;
