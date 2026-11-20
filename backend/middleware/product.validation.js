import { body, query, param } from "express-validator";

const validFoodTypes = ["veg", "non-veg", "drink"];

export const createProductValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Product name must be 2–100 characters"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("price").isFloat({ min: 0 }).withMessage("Enter a valid product price"),

  body("category").isMongoId().withMessage("Invalid category ID"),

  body("foodType").isIn(validFoodTypes).withMessage("Invalid food type"),

  body("featured")
    .optional()
    .isBoolean()
    .withMessage("Featured must be true or false"),

  body("sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Invalid sort order"),
];

export const productIdValidation = [
  param("id").isMongoId().withMessage("Invalid product ID"),
];

export const menuQueryValidation = [
  query("page").optional().isInt({ min: 1 }).withMessage("Invalid page number"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 30 })
    .withMessage("Limit must be between 1 and 30"),

  query("foodType")
    .optional()
    .isIn(validFoodTypes)
    .withMessage("Invalid food type"),

  query("featured")
    .optional()
    .isBoolean()
    .withMessage("Invalid featured value"),

  query("search")
    .optional()
    .isString()
    .isLength({ max: 50 })
    .withMessage("Search cannot exceed 50 characters"),
];
