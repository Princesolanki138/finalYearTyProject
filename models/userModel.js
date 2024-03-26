import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensure email uniqueness
    lowercase: true, // Normalize email to lowercase
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String, // Changed to String for flexibility (e.g., to include country code)
    required: true,
  },
  address: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'address',
  }],
  gender: {
    type: String,
  },
  dob: {
    type: Date,
  },
  wishlist: {
    type: [mongoose.Schema.Types.ObjectId], // Assuming wishlist items are references to products
    ref: 'cart', // Reference to the Product model
    default: []
  },
  orders: {
    type: [mongoose.Schema.Types.ObjectId], // Assuming orders are references to order documents
    ref: 'Order', // Reference to the Order model
    default: []
  },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
