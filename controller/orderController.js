import Address from "../models/addressModel.js";
import cartModel from "../models/cartModel.js";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import Razorpay from "razorpay";
import crypto from "crypto";
const rozarpayinstance = new Razorpay({
  key_id: "rzp_test_raNMlh9GYX3QXF",
  key_secret: "to9Jss98ZLXonh8uhQ2GHUUB",
});

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

    const UserAddress = `${address?.Area || ' '}, ${address?.landmark || ' '}, ${address?.street || ' '}, ${address.city}, ${address?.state || ' '}, ${address?.pincode || ' '}, ${address?.country || ' '}`;

    if (!UserAddress) {
      return res.status(404).send({ success: false, message: 'Address not found' });
    }

    const newOrder = new Order({
      user: userId,
      items: orderItems,
      totalAmount: totalAmount,
      razorpay_order_id: razorpay_order_id || null,
      razorpay_payment_id: razorpay_payment_id || null,
      userAddress: UserAddress,
      paymentDone: true
    });

    const savedOrder = await newOrder.save();

    //  Clear cart items after order creation
    cart.items = []
    cart.totalCartItem = 0
    cart.totalCartValue = 0

    await cart.save();


    res.status(201).send({ success: true, message: 'Order created successfully', order: savedOrder, updatedCart: { _id: cart._id, items: cart.items, totalCartItem: cart.totalCartItem, totalCartValue: cart.totalCartValue, } });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).send({ success: false, error, message: 'Error creating order' });
  }
}

export const getOrderOfUser = async (req, res) => {
  try {
    const { id } = req.params
    const userId = id
    console.log(userId)

    const orders = await Order.find({ user: userId }).populate(-'user').populate('items.product');
    // console.log(orders)


    if (!orders || orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Orders not found for this user' });
    }

    res.status(200).json({ success: true, message: 'Orders fetched successfully', orders });

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).send({ success: false, error, message: 'Error fetching orders' });
  }
}


export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('items.product');
    // total profit of all orders
    const totalProfit = orders.reduce((acc, order) => acc + order.totalAmount, 0);

    res.status(200).json({ success: true, orders, totalProfit });

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).send({ success: false, error, message: 'Error fetching orders' });

  }
}

export const rozarpayCreateOrder = async (req, res) => {
  try {
    const { cartId, option } = req.body;
    console.log(cartId);

    //check cart is available or not in db
    const userCart = await cartModel.findById(cartId);
    if (!userCart) {
      res.status(404).send({
        success: false,
        message: "Cart not found",
      });
    }
    // const amount = userCart.totalCartValue;

    console.log("opt work");
    const order = await rozarpayinstance.orders.create(option);
    console.log("orderss", order);
    res.status(200).send({
      success: true,
      order,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
};

export const orderpaymentVerify = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  console.log(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  const sha = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET_KEY);
  console.log("key", process.env.RAZORPAY_SECRET_KEY);
  sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = sha.digest("hex");
  console.log(digest, razorpay_signature);

  if (digest !== razorpay_signature) {
    res.status(400).json({
      success: false,
      message: "Razorpay signature verification failed",
    });
  } else {
    res.status(200).json({
      success: true,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      message: "payment sucessfull",
    });
  }
};

