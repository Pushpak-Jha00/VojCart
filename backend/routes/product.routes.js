import express from "express";

import validate from "../middleware/validate.middleware.js";

import {
  createProductValidation,
  productIdValidation,
} from "../middleware/product.validation.js";

import {
  createProduct,
  getPublicProducts,
  getPublicProductById,
  getAdminProducts,
  getAdminProductById,
  updateProduct,
  toggleProductAvailability,
  softDeleteProduct,
  restoreProduct,
  permanentDeleteProduct,
} from "../controllers/product.controller.js";

import { protectAdmin } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

const debugUpload = (req, res, next) => {
  console.log("Content-Type:", req.headers["content-type"]);
  console.log("Uploaded file:", req.file);
  console.log("Request body:", req.body);

  next();
};

// Public menu APIs
router.get("/", getPublicProducts);
router.get("/:id", getPublicProductById);

// Admin APIs
router.get("/admin/all", protectAdmin, getAdminProducts);
router.get("/admin/:id", protectAdmin, getAdminProductById);

router.post(
  "/",
  protectAdmin,
  upload.single("image"),
  debugUpload,
  createProductValidation,
  validate,
  createProduct,
);

router.put(
  "/:id",
  protectAdmin,
  productIdValidation,
  upload.single("image"),
  validate,
  updateProduct,
);

router.patch("/:id/availability", protectAdmin, toggleProductAvailability);

router.patch("/:id/restore", protectAdmin, restoreProduct);

router.delete("/:id/permanent", protectAdmin, permanentDeleteProduct);

router.delete("/:id", protectAdmin, softDeleteProduct);

export default router;
