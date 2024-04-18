import Address from "../models/addressModel.js";
import cartModel from "../models/cartModel.js";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";

export const createOrder = async (req, res) => {
  try {
    const { cartId, razorpay_order_id, razorpay_payment_id } = req.body
    const userId = req.user._id
    console.log(userId)
    console.log(cartId)
    console.log(razorpay_order_id)
    console.log(razorpay_payment_id)

    const cart = await cartModel.findOne({ _id: cartId, user: userId }).populate('items.product')
    console.log(cart)

    console.log(cart)

    if (!cart) {
      return res.status(404).send({ success: false, message: 'Cart not found' });
    }
    if (cart.totalCartItem === 0) {
      return res.status(404).send({ success: false, message: 'Cart is empty' });
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

    // get user address

    const user = await User.findById(req.user._id);
    const addressId = user.address[0]; // Assuming address ID is at index 0
    const address = await Address.findById(addressId);
    const userAddress = addressId


    const UserAddressInString = `${address.Area || " "}, ${address.landmark || " "}, ${address.street || " "}, ${address.city || " "}, ${address.state || " "}, ${address.pincode || " "}, ${address.country || " "}`
    const newOrder = new Order({
      user: userId,
      items: orderItems,
      totalAmount: totalAmount,
      razorpay_order_id: razorpay_order_id || null,
      razorpay_payment_id: razorpay_payment_id || null,
      userAddress: userAddress
    });

    const savedOrder = await newOrder.save();

    //  Clear cart items after order creation
    cart.items = []
    cart.totalCartItem = 0
    cart.totalCartValue = 0

    await cart.save();


    res.status(201).send({ success: true, message: 'Order created successfully', order: savedOrder, userAddress: UserAddressInString, updatedCart: { _id: cart._id, items: cart.items, totalCartItem: cart.totalCartItem, totalCartValue: cart.totalCartValue, } });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).send({ success: false, error, message: 'Error creating order' });
  }
}

export const getOrderOfUser = async (req, res) => {
  try {
    const { orderId } = req.params._id
    const orders = await Order.find({ orderId: Order._id }).populate('items.product');

    if (!orders || orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Orders not found for this user' });
    }
    const user = await User.findById(req.user._id);
    const addressId = user.address[0]; // Assuming address ID is at index 0
    const address = await Address.findById(addressId);


    const UserAddressInString = `${address.Area || " "}, ${address.landmark || " "}, ${address.street || " "}, ${address.city || " "}, ${address.state || " "}, ${address.pincode || " "}, ${address.country || " "}`


    res.status(200).json({ success: true, message: 'Orders fetched successfully', orders, userAddress: UserAddressInString });

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).send({ success: false, error, message: 'Error fetching orders' });
  }
}


export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('items.product');
    res.status(200).json({ success: true, orders });

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).send({ success: false, error, message: 'Error fetching orders' });

  }
}