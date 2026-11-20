import express from "express";

import { menuQueryValidation } from "../middleware/product.validation.js";

import { getMenu, generateMenuQR } from "../controllers/menu.controller.js";

import { protectAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public menu
router.get("/", menuQueryValidation, getMenu);

// Admin QR generation
router.get("/qr", protectAdmin, generateMenuQR);

export default router;
