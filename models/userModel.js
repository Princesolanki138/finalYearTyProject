import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: Number,
    required: true
  },
  address: {
    type: String,
  },
  pincode: {
    type: Number,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  country: {
    type: String,
    default: "India"
  },
  cart: {
    type: Array,
    default: [],

  },
  wishlist: {
    type: Array,
    default: [],
  },
  orders: {
    type: Array,
    default: [],
  },
}, { timestamps: true })
export default mongoose.model("Users", userSchema);
