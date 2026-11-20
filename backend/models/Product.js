import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      maxlength: 500,
    },

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },

    image: {
      public_id: {
        type: String,
        required: [true, "Cloudinary image ID is required"],
      },

      url: {
        type: String,
        required: [true, "Product image URL is required"],
      },
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"],
    },

    foodType: {
      type: String,
      enum: ["veg", "non-veg", "drink"],
      required: [true, "Food type is required"],
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    availabilityBeforeDelete: {
      type: Boolean,
      default: true,
    },

    featured: {
      type: Boolean,
      default: false,
    },

    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Optimized indexes for customer menu
productSchema.index({
  isDeleted: 1,
  isAvailable: 1,
  foodType: 1,
});

productSchema.index({
  category: 1,
  isDeleted: 1,
  isAvailable: 1,
});

productSchema.index({
  createdAt: -1,
});

const Product = mongoose.model("Product", productSchema);

export default Product;
