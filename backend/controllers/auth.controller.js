import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import generateToken from "../utils/generateToken.js";
import cookieOptions from "../utils/cookieOptions.js";

// ADMIN LOGIN
export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const admin = await User.findOne({
    email: email.toLowerCase().trim(),
    role: "admin",
  }).select("+password");

  if (!admin) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!admin.isActive) {
    throw new ApiError(403, "Your account has been disabled");
  }

  const isPasswordCorrect = await admin.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid email or password");
  }

  admin.lastLogin = new Date();
  await admin.save();

  const token = generateToken(admin._id);

  res.cookie("vojcart_token", token, cookieOptions);

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    admin: {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  });
});

// GET CURRENT ADMIN
export const getCurrentAdmin = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    admin: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

// ADMIN LOGOUT
export const logoutAdmin = asyncHandler(async (req, res) => {
  res.clearCookie("vojcart_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});
