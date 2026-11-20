import Product from "../models/Product.js";
import Category from "../models/Category.js";

import asyncHandler from "../utils/asyncHandler.js";

export const getDashboardOverview = asyncHandler(async (req, res) => {
  const activeProductFilter = {
    isDeleted: false,
  };

  const [
    totalProducts,
    availableProducts,
    unavailableProducts,
    deletedProducts,
    totalCategories,
    activeCategories,
    foodDistribution,
    recentlyAddedProducts,
  ] = await Promise.all([
    // Total products excluding deleted products
    Product.countDocuments(activeProductFilter),

    // Available products
    Product.countDocuments({
      ...activeProductFilter,
      isAvailable: true,
    }),

    // Unavailable products
    Product.countDocuments({
      ...activeProductFilter,
      isAvailable: false,
    }),

    // Soft deleted products
    Product.countDocuments({
      isDeleted: true,
    }),

    // All categories
    Category.countDocuments(),

    // Active categories
    Category.countDocuments({
      isActive: true,
    }),

    // Food type distribution
    Product.aggregate([
      {
        $match: activeProductFilter,
      },
      {
        $group: {
          _id: "$foodType",
          total: { $sum: 1 },
          available: {
            $sum: {
              $cond: ["$isAvailable", 1, 0],
            },
          },
        },
      },
    ]),

    // Recently added products
    Product.find(activeProductFilter)
      .select("name price image foodType isAvailable createdAt")
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  // Initialize food distribution
  const distribution = {
    veg: {
      total: 0,
      available: 0,
    },
    "non-veg": {
      total: 0,
      available: 0,
    },
    drink: {
      total: 0,
      available: 0,
    },
  };

  foodDistribution.forEach((item) => {
    if (distribution[item._id]) {
      distribution[item._id] = {
        total: item.total,
        available: item.available,
      };
    }
  });

  res.status(200).json({
    success: true,

    overview: {
      totalProducts,
      availableProducts,
      unavailableProducts,
      deletedProducts,
      totalCategories,
      activeCategories,
    },

    foodDistribution: distribution,

    recentlyAddedProducts,
  });
});
