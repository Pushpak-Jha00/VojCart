import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const name = process.env.ADMIN_NAME;
    const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    const password = process.env.ADMIN_PASSWORD;

    if (!name || !email || !password) {
      throw new Error(
        "ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD are required",
      );
    }

    if (password.length < 12) {
      throw new Error("Admin password must contain at least 12 characters");
    }

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      throw new Error("An account with this email already exists");
    }

    const admin = await User.create({
      name,
      email,
      password,
      role: "admin",
    });

    console.log("Admin created successfully:", admin.email);
  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();
