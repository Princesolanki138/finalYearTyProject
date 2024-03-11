import mongoose from "mongoose";


const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  mrp: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  modelno: {
    type: String,
    required: true,
  },
  images: {
    type: String,
    required: true,
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
    type: String,
    required: true,
  },
  strapColor: {
    type: String,
    required: true,
  },
})

const product = mongoose.model("products", productSchema)

export default product