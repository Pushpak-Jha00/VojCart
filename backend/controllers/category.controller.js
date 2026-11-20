import mongoose from "mongoose";

import Category from "../models/Category.js";
import Product from "../models/Product.js";

import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const validateId = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid category ID");
  }
};

const createSlug = (value) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

// CREATE CATEGORY
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, sortOrder } = req.body;

  if (!name?.trim()) {
    throw new ApiError(400, "Category name is required");
  }

  const slug = createSlug(name);

  if (!slug) {
    throw new ApiError(400, "Invalid category name");
  }

  const existingCategory = await Category.findOne({
    $or: [{ name: name.trim() }, { slug }],
  });

  if (existingCategory) {
    throw new ApiError(409, "Category already exists");
  }

  const order = Number(sortOrder ?? 0);

  if (!Number.isInteger(order) || order < 0) {
    throw new ApiError(400, "Invalid sort order");
  }

  const category = await Category.create({
    name: name.trim(),
    slug,
    description: description?.trim() || "",
    sortOrder: order,
  });

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    category,
  });
});

// PUBLIC: GET ACTIVE CATEGORIES
export const getPublicCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({
    isActive: true,
  })
    .select("name slug description image sortOrder")
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  res.status(200).json({
    success: true,
    categories,
  });
});

// PUBLIC: GET SINGLE CATEGORY
export const getPublicCategoryById = asyncHandler(async (req, res) => {
  validateId(req.params.id);

  const category = await Category.findOne({
    _id: req.params.id,
    isActive: true,
  })
    .select("name slug description image sortOrder")
    .lean();

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  res.status(200).json({
    success: true,
    category,
  });
});

// ADMIN: GET ALL CATEGORIES
export const getAdminCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find()
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    categories,
  });
});

// UPDATE CATEGORY
export const updateCategory = asyncHandler(async (req, res) => {
  validateId(req.params.id);

  const { name, description, sortOrder } = req.body;

  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      throw new ApiError(400, "Invalid category name");
    }

    const trimmedName = name.trim();
    const slug = createSlug(trimmedName);

    const existingCategory = await Category.findOne({
      _id: { $ne: category._id },
      $or: [{ name: trimmedName }, { slug }],
    });

    if (existingCategory) {
      throw new ApiError(409, "Category name already exists");
    }

    category.name = trimmedName;
    category.slug = slug;
  }

  if (description !== undefined) {
    if (typeof description !== "string" || description.length > 200) {
      throw new ApiError(400, "Invalid category description");
    }

    category.description = description.trim();
  }

  if (sortOrder !== undefined) {
    const order = Number(sortOrder);

    if (!Number.isInteger(order) || order < 0) {
      throw new ApiError(400, "Invalid sort order");
    }

    category.sortOrder = order;
  }

  await category.save();

  res.status(200).json({
    success: true,
    message: "Category updated successfully",
    category,
  });
});

// ENABLE / DISABLE CATEGORY
export const toggleCategoryStatus = asyncHandler(async (req, res) => {
  validateId(req.params.id);

  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  category.isActive = !category.isActive;

  await category.save();

  res.status(200).json({
    success: true,
    message: category.isActive
      ? "Category activated successfully"
      : "Category deactivated successfully",
    category,
  });
});

// PERMANENT DELETE CATEGORY
export const deleteCategory = asyncHandler(async (req, res) => {
  validateId(req.params.id);

  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  const hasProducts = await Product.exists({
    category: category._id,
  });

  if (hasProducts) {
    throw new ApiError(
      409,
      "Cannot delete category while products are assigned to it. Reassign or remove those products first.",
    );
  }

  await category.deleteOne();

  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
  });
});
