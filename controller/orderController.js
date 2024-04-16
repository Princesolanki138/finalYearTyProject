import cartModel from "../models/cartModel.js";
import Order from "../models/orderModel.js";

export const createOrder = async (req, res) => {
  try {
    const { cartId, orderId, paymentId } = req.body
    const userId = req.user._id
    console.log(userId)

    const cart = await cartModel.findOne({ _id: cartId, user: userId }).populate('items.product')

    if (!cart) {
      return res.status(404).send({ success: false, message: 'Cart not found' });
    }

    //calculate total price
    let totalAmount = 0;
    const orderItems = cart.items.map(cartItem => {
      const subtotal = cartItem.product.price * cartItem.quantity;
      totalAmount += subtotal;
      return {
        product: cartItem.product._id,
        quantity: cartItem.quantity,
        price: cartItem.product.price
      };
    });

    // Create a new order instance
    const newOrder = new Order({
      user: userId,
      items: orderItems,
      totalAmount: totalAmount,
      orderId: orderId,
      paymentId: paymentId
    });

    const savedOrder = await newOrder.save();

    //  Clear cart items after order creation
    // cart.items = [];
    // cart.totalCartItem = 0;
    // cart.totalCartValue = 0;
    // await cart.save();

    res.status(200).send({ success: true, message: 'Order created successfully', order: savedOrder });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).send({ success: false, error, message: 'Error creating order' });
  }
}