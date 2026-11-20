import express from "express";

import { loginValidation } from "../middleware/auth.validation.js";

import validate from "../middleware/validate.middleware.js";

import {
  loginAdmin,
  getCurrentAdmin,
  logoutAdmin,
} from "../controllers/auth.controller.js";

import { protectAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public login
router.post("/login",  loginValidation, validate, loginAdmin);

// Protected routes
router.get("/me", protectAdmin, getCurrentAdmin);
router.post("/logout", protectAdmin, logoutAdmin);

export default router;
