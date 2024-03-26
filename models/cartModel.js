import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Reference to the Product model
    required: true
  },
  quantity: {
    type: Number,
    default: 1
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true
  },
  items: [cartItemSchema], // Array of cart items
  totalCartItem: {
    type: Number,
    default: 0
  },
  totalCartValue: {
    type: Number,
    default: 0
  }

});

export default mongoose.model("Cart", cartSchema);
