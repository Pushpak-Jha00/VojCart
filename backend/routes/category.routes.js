import express from "express";

import {
  createCategory,
  getPublicCategories,
  getPublicCategoryById,
  getAdminCategories,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory,
} from "../controllers/category.controller.js";

import { protectAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Admin routes
router.get("/admin/all", protectAdmin, getAdminCategories);

router.post("/", protectAdmin, createCategory);

router.put("/:id", protectAdmin, updateCategory);

router.patch("/:id/status", protectAdmin, toggleCategoryStatus);

router.delete("/:id", protectAdmin, deleteCategory);

// Public routes
router.get("/", getPublicCategories);
router.get("/:id", getPublicCategoryById);

export default router;
