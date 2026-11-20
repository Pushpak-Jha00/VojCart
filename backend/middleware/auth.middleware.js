import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const protectAdmin = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.vojcart_token;

  if (!token) {
    throw new ApiError(401, "Authentication required");
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired session");
  }

  const admin = await User.findById(decoded.id);

  if (!admin) {
    throw new ApiError(401, "Admin account not found");
  }

  if (!admin.isActive || admin.role !== "admin") {
    throw new ApiError(403, "Access denied");
  }

  req.user = admin;

  next();
});
