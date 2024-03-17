import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  Area: {
    type: String,
  },
  landmark: {
    type: String,
  },
  street: {
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
  },

}, { timestamps: true });

export default mongoose.model("address", addressSchema);
