import mongoose from "mongoose";
import QRCode from "qrcode";

import Product from "../models/Product.js";
import Category from "../models/Category.js";

import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getMenu = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);

  const limit = Math.min(30, Math.max(1, Number(req.query.limit) || 12));

  const skip = (page - 1) * limit;

  const { category, foodType, search, featured } = req.query;

  // Only active categories are visible to customers
  const categories = await Category.find({
    isActive: true,
  })
    .select("name slug description image sortOrder")
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  const activeCategoryIds = categories.map((item) => item._id);

  const filter = {
    isDeleted: false,
    category: { $in: activeCategoryIds },
  };

  // Category filtering by slug
  if (category) {
    const selectedCategory = categories.find((item) => item.slug === category);

    if (!selectedCategory) {
      throw new ApiError(404, "Category not found");
    }

    filter.category = selectedCategory._id;
  }

  // Food type filtering
  if (foodType) {
    if (!["veg", "non-veg", "drink"].includes(foodType)) {
      throw new ApiError(400, "Invalid food type");
    }

    filter.foodType = foodType;
  }

  // Search products by name
  if (search?.trim()) {
    const escapedSearch = search
      .trim()
      .slice(0, 50)
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    filter.name = {
      $regex: escapedSearch,
      $options: "i",
    };
  }

  // Featured products
  if (featured === "true") {
    filter.featured = true;
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

  // Browser and CDN caching
  res.set(
    "Cache-Control",
    "public, max-age=30, s-maxage=60, stale-while-revalidate=120",
  );

  res.status(200).json({
    success: true,
    categories,
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

// ADMIN: GENERATE MENU QR CODE
export const generateMenuQR = asyncHandler(async (req, res) => {
  const menuUrl = process.env.PUBLIC_MENU_URL;

  if (!menuUrl) {
    throw new ApiError(500, "Public menu URL is not configured");
  }

  let validUrl;

  try {
    validUrl = new URL(menuUrl);
  } catch {
    throw new ApiError(500, "Invalid public menu URL");
  }

  if (process.env.NODE_ENV === "production" && validUrl.protocol !== "https:") {
    throw new ApiError(500, "Production menu URL must use HTTPS");
  }

  const qrCode = await QRCode.toDataURL(menuUrl, {
    errorCorrectionLevel: "H",
    type: "image/png",
    width: 600,
    margin: 2,
    color: {
      dark: "#171717",
      light: "#FFFFFF",
    },
  });

  res.status(200).json({
    success: true,
    message: "Menu QR generated successfully",
    menuUrl,
    qrCode,
  });
});
