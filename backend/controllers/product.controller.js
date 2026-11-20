import mongoose from "mongoose";
import { getIO } from "../socket/socket.js";

import Product from "../models/Product.js";
import Category from "../models/Category.js";

import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import deleteFromCloudinary from "../utils/deleteFromCloudinary.js";

// Helper: Validate MongoDB ID
const validateId = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid product ID");
  }
};

// Helper: Pagination
const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);

  const limit = Math.min(30, Math.max(1, parseInt(query.limit, 10) || 12));

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

// CREATE PRODUCT
export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, foodType, featured, sortOrder } =
    req.body;

  if (!name || !description || price === undefined || !category || !foodType) {
    throw new ApiError(400, "All required fields must be provided");
  }

  if (!req.file) {
    throw new ApiError(400, "Product image is required");
  }

  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice) || numericPrice < 0) {
    throw new ApiError(400, "Enter a valid product price");
  }

  if (!["veg", "non-veg", "drink"].includes(foodType)) {
    throw new ApiError(400, "Invalid food type");
  }

  const existingCategory = await Category.findOne({
    _id: category,
    isActive: true,
  });

  if (!existingCategory) {
    throw new ApiError(400, "Selected category is unavailable");
  }

  const uploadedImage = await uploadToCloudinary(req.file.buffer);

  try {
    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: numericPrice,
      category,
      foodType,
      image: {
        public_id: uploadedImage.public_id,
        url: uploadedImage.secure_url,
      },
      featured: featured === "true",
      sortOrder: Number(sortOrder) || 0,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    await deleteFromCloudinary(uploadedImage.public_id);
    throw error;
  }
});

// CUSTOMER MENU PRODUCTS
export const getPublicProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const { category, foodType, search, featured } = req.query;

  const filter = {
    isDeleted: false,
  };

  if (category) {
    if (!mongoose.isValidObjectId(category)) {
      throw new ApiError(400, "Invalid category ID");
    }

    filter.category = category;
  }

  if (foodType) {
    if (!["veg", "non-veg", "drink"].includes(foodType)) {
      throw new ApiError(400, "Invalid food type");
    }

    filter.foodType = foodType;
  }

  if (featured === "true") {
    filter.featured = true;
  }

  if (search?.trim()) {
    filter.name = {
      $regex: search
        .trim()
        .slice(0, 50)
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      $options: "i",
    };
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .select(
        "name description price image category foodType isAvailable featured sortOrder",
      )
      .populate("category", "name slug")
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
    },
  });
});

// SINGLE CUSTOMER PRODUCT
export const getPublicProductById = asyncHandler(async (req, res) => {
  validateId(req.params.id);

  const product = await Product.findOne({
    _id: req.params.id,
    isDeleted: false,
  })
    .select(
      "name description price image category foodType isAvailable featured",
    )
    .populate("category", "name slug")
    .lean();

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  res.status(200).json({
    success: true,
    product,
  });
});

// ADMIN: GET ALL PRODUCTS INCLUDING DELETED
export const getAdminProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const { search, foodType, status } = req.query;

  const filter = {};

  if (status === "deleted") {
    filter.isDeleted = true;
  } else if (status === "active") {
    filter.isDeleted = false;
  }

  if (foodType) {
    filter.foodType = foodType;
  }

  if (search?.trim()) {
    filter.name = {
      $regex: search
        .trim()
        .slice(0, 50)
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      $options: "i",
    };
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// ADMIN: GET SINGLE PRODUCT
export const getAdminProductById = asyncHandler(async (req, res) => {
  validateId(req.params.id);

  const product = await Product.findById(req.params.id)
    .populate("category", "name slug")
    .lean();

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  res.status(200).json({
    success: true,
    product,
  });
});

// UPDATE PRODUCT
export const updateProduct = asyncHandler(async (req, res) => {
  validateId(req.params.id);

  const product = await Product.findOne({
    _id: req.params.id,
    isDeleted: false,
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const allowedFields = [
    "name",
    "description",
    "price",
    "category",
    "foodType",
    "featured",
    "sortOrder",
  ];

  const updates = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  if (updates.name !== undefined) {
    updates.name = String(updates.name).trim();

    if (!updates.name || updates.name.length > 100) {
      throw new ApiError(400, "Invalid product name");
    }
  }

  if (updates.description !== undefined) {
    updates.description = String(updates.description).trim();

    if (!updates.description || updates.description.length > 500) {
      throw new ApiError(400, "Invalid product description");
    }
  }

  if (updates.price !== undefined) {
    updates.price = Number(updates.price);

    if (!Number.isFinite(updates.price) || updates.price < 0) {
      throw new ApiError(400, "Invalid product price");
    }
  }

  if (updates.foodType !== undefined) {
    if (!["veg", "non-veg", "drink"].includes(updates.foodType)) {
      throw new ApiError(400, "Invalid food type");
    }
  }

  if (updates.category !== undefined) {
    const validCategory = await Category.findOne({
      _id: updates.category,
      isActive: true,
    });

    if (!validCategory) {
      throw new ApiError(400, "Selected category is unavailable");
    }
  }

  if (updates.featured !== undefined) {
    updates.featured = updates.featured === "true" || updates.featured === true;
  }

  if (updates.sortOrder !== undefined) {
    updates.sortOrder = Number(updates.sortOrder);

    if (!Number.isInteger(updates.sortOrder) || updates.sortOrder < 0) {
      throw new ApiError(400, "Invalid sort order");
    }
  }

  const previousImageId = product.image.public_id;

  let uploadedImage = null;

  if (req.file) {
    uploadedImage = await uploadToCloudinary(req.file.buffer);

    updates.image = {
      public_id: uploadedImage.public_id,
      url: uploadedImage.secure_url,
    };
  }

  try {
    Object.assign(product, updates);

    await product.save();
    if (uploadedImage && previousImageId) {
      try {
        await deleteFromCloudinary(previousImageId);
      } catch (error) {
        console.error("Old Cloudinary image cleanup failed:", error.message);
      }
    }
  } catch (error) {
    if (uploadedImage) {
      await deleteFromCloudinary(uploadedImage.public_id);
    }

    throw error;
  }

  // Delete old image only after database update succeeds
  if (uploadedImage && product.image.public_id !== uploadedImage.public_id) {
    // The previous image ID must be captured before replacement.
  }

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    product,
  });
});

// TOGGLE PRODUCT AVAILABILITY
export const toggleProductAvailability = asyncHandler(async (req, res) => {
  validateId(req.params.id);

  const product = await Product.findOne({
    _id: req.params.id,
    isDeleted: false,
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  product.isAvailable = !product.isAvailable;

  await product.save();

  getIO().emit("product:availability-updated", {
  productId: product._id.toString(),
  isAvailable: product.isAvailable,
});

  res.status(200).json({
    success: true,
    message: product.isAvailable
      ? "Product is now available"
      : "Product is now unavailable",
    product,
  });
});

// SOFT DELETE PRODUCT
export const softDeleteProduct = asyncHandler(async (req, res) => {
  validateId(req.params.id);

  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (product.isDeleted) {
    throw new ApiError(400, "Product is already deleted");
  }

  product.availabilityBeforeDelete = product.isAvailable;
  product.isAvailable = false;
  product.isDeleted = true;
  product.deletedAt = new Date();

  await product.save();

  res.status(200).json({
    success: true,
    message: "Product moved to recycle bin",
  });
});

// RESTORE PRODUCT
export const restoreProduct = asyncHandler(async (req, res) => {
  validateId(req.params.id);

  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (!product.isDeleted) {
    throw new ApiError(400, "Product is not deleted");
  }

  product.isDeleted = false;
  product.isAvailable = product.availabilityBeforeDelete;
  product.deletedAt = null;

  await product.save();

  res.status(200).json({
    success: true,
    message: "Product restored successfully",
    product,
  });
});

// PERMANENT DELETE PRODUCT
export const permanentDeleteProduct = asyncHandler(async (req, res) => {
  validateId(req.params.id);

  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (!product.isDeleted) {
    throw new ApiError(
      400,
      "Soft delete the product before permanent deletion",
    );
  }

  // Remove database record first.
  await product.deleteOne();

  // Cloudinary cleanup
  try {
    await deleteFromCloudinary(product.image.public_id);
  } catch (error) {
    console.error("Cloudinary cleanup failed:", error.message);
  }

  res.status(200).json({
    success: true,
    message: "Product permanently deleted",
  });
});
