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
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'product',
  },
  orders: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Order',
  },
 otp: {
      type: Number, // otp for forget password
    },
  
}, { timestamps: true });


const User = mongoose.model("User", userSchema);

export default User
