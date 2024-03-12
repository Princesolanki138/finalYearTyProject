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
    data: Buffer,
    contentType: Array
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
    type: Array,
    required: true,
  },
  strapColor: {
    type: Array,
    required: true,
  },
})

const product = mongoose.model("products", productSchema)

export default product