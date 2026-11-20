import { body, param } from "express-validator";

export const createCategoryValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Category name must be 2–50 characters"),

  body("description")
    .optional()
    .isString()
    .isLength({ max: 200 })
    .withMessage("Description cannot exceed 200 characters"),

  body("sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Invalid sort order"),
];

export const categoryIdValidation = [
  param("id").isMongoId().withMessage("Invalid category ID"),
];
