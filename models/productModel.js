import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  mrp: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  modelno: {
    type: String,
    required: true,
  },
  images: {
    type: [String], // cloudinary url
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'category',
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  warranty: {
    type: Number,
    required: true,
  },
  country_of_origin: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  dialcolor: {
    type: [String], // Changed to array of strings to store multiple dial colors
    required: true,
  },
  strapColor: {
    type: [String], // Changed to array of strings to store multiple strap colors
    required: true,
  },
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema); // Changed model name to singular and capitalized

export default Product;
