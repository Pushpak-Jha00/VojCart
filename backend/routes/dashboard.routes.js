import express from "express";

import { getDashboardOverview } from "../controllers/dashboard.controller.js";

import { protectAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// All dashboard routes require admin authentication
router.use(protectAdmin);

router.get("/overview", getDashboardOverview);

export default router;
