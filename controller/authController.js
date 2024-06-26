import JWT from "jsonwebtoken"
import nodemailer from "nodemailer"
import { comparePassd, hashPassword } from "../helpers/authHelper.js"
import User from "../models/userModel.js"
import Address from "../models/addressModel.js"
import Cart from "../models/cartModel.js"
import Product from "../models/productModel.js"
import Category from "../models/categoryModel.js"
import Order from "../models/orderModel.js"


//register controller
export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, addressData, gender, dob } = req.body;

    // Validation 
    if (!name || !email || !password || !phone) {
      return res.status(400).send({ message: 'All fields are required' });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ message: 'User already exists. Please login.' });
    }

    // Create new address
    const newAddress = await Address.create(addressData);

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      gender,
      dob,
      address: newAddress._id,
      // Save address ID in user's address array
    });

    res.status(201)
      .send({
        success: true,
        message: 'User registered successfully',
        user: newUser,
      });
  } catch (error) {
    console.error('Error in registerController:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).send({ success: false, message: error.message });
    } else {
      return res.status(500).send({ success: false, message: 'Server Error' });
    }
  }
};


//login controller

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    //validation
    if (!email || !password) {
      return res.status(404).send({
        success: false,
        message: "Invalid email or password",
      })
    };
    //check user
    const user = await User.findOne({ email }).populate("address");
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email is not registerd"
      })
    }
    const matchPassd = await comparePassd(password, user.password)
    if (!matchPassd) {
      return res.status(200).send({
        success: false,
        message: "Wrong Password",
      })
    }

    // Fetch address associated with the user
    const addressId = user.address[0]; // Assuming address ID is at index 0
    const address = await Address.findById(addressId);

    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // // fetch all product in cart items
    const cart = await Cart.findOne({ user: user._id });
    if (!cart) {
      const newCart = await Cart.create({ user: user._id, items: [], totalCartItem: 0, totalCartValue: 0 });
    }
    if (!cart || !cart.items || cart.items.length === 0) {
      res.status(200)
        .set('Content-Transfer-Encoding', 'application/gzip')
        .send({
          success: true,
          message: 'login successfully',
          user: {
            _id: user._id || null,
            name: user.name || null,
            email: user.email || null,
            phone: user.phone || null,
            gender: user.gender || null,
            dob: user.dob || null,
            address: address ? {
              id: address._id,
              Area: address.Area || null,
              pincode: address.pincode || null,
              landmark: address.landmark || null,
              state: address.state || null,
              street: address.street || null,
              city: address.city || null,
              country: address.country || "India",
            } : null
          },
          cartId: cart._id,
          cart: { items: [], totalCartItem: 0, totalCartValue: 0 },
          token
        })
    }
    else {

      const cartItems = await Promise.all(cart.items.map(async (item) => {
        const productDetails = await Product.findById(item.product);
        return {
          ...item.toObject(),
          product: productDetails
        }
      }))

      const totalCartItem = cartItems.length;

      cart.totalCartValue = cart.items.reduce((total, item) => total + item.quantity * item.product.price, 0);



      res.status(200)
        .set('Content-Transfer-Encoding', 'application/gzip')
        .send({
          success: true,
          message: "login successfully",
          user: {
            _id: user._id || null,
            name: user.name || null,
            email: user.email || null,
            phone: user.phone || null,
            gender: user.gender || null,
            dob: user.dob || null,
            address: address ? {
              id: address._id,
              Area: address.Area || null,
              pincode: address.pincode || null,
              landmark: address.landmark || null,
              state: address.state || null,
              street: address.street || null,
              city: address.city || null,
              country: address.country || "India",
            } : null
          },
          cartId: cart._id,
          cartItems,
          totalCartItem,
          totalCartValue: cart.totalCartValue,
          token
        })
    }
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success: false,
      message: "error in login controller",
      error
    })
  }
}


export const ForgetPasssword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email);
    // console.log(email);
    const existingUser = await User.findOne({ email }).populate("address");
    // console.log(existingUser);
    // return res.send(existingUser);
    if (!existingUser) {
      return res.status(400).send({ message: "User is not register" });
    } else {
      const UniqueOtp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

      const transporter = nodemailer.createTransport({
        // host: "smtp.ethereal.email",
        service: "Gmail",
        // port: 465,
        // secure: true, // Use `true` for port 465, `false` for all other ports
        auth: {
          user: "goodtimes4info@gmail.com",
          pass: "pabnwuosocqvmwfg",
        },
      });
      async function main() {
        const info = await transporter.sendMail({
          from: '"GoodTimes" goodtimes4info@gmail.com', // sender address
          to: email, // list of receivers
          subject: "Hello ✔", // Subject line
          text: `OTP for Forget Password ${UniqueOtp}`, // plain text body
          // html: "<b>Hello world?</b>", // html body
        });
        console.log("Message sent: %s", info.messageId);
        // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
      }
      main();
      console.log(existingUser);
      const userss = await User.findByIdAndUpdate(existingUser._id, {
        otp: UniqueOtp,
      });

      console.log(userss);
      return res.status(200).send({
        success: true,
        message: "OTP sent sucessfully to your register email id",
        // data: userss,
      });
    }
  } catch (error) {
    console.log(error);
    return res.send({ error });
  }
};

export const ForgetPassswordOtpChecked = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const userr = await User.findOne({ email });
    console.log(userr);
    if (userr.otp === otp) {
      return res.status(200).json({
        success: true,
        message: "OTP is verified",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Wrong OTP. Please Verify and try again",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).send({
        success: true,
        message: "user not found",
      });
    }

    const newPassword = await hashPassword(password);
    const newuser = await User.findByIdAndUpdate(
      user._id,
      {
        password: newPassword,
      },
      { new: true }
    );
    // const matchPass = await comparePassd(password, user.password);
    res.status(200).send({
      success: true,
      message: "Password Change Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};


export const testController = async (req, res) => {
  console.log("protecter")
  try {
    res.send({
      message: "Protected routes",
    });
  } catch (error) {
    console.log(error);
    res.send({ error });
  }
};

// update profile

export const updateProfile = async (req, res) => {
  try {
    const { name, email, password, address, phone, gender, dob } = req.body;
    const user = await User.findById(req.user._id);

    if (password && password.length < 6) {
      return res.status(400).json({ error: "Password is required and must be at least 6 characters long" });
    }

    let updatedAddress;
    if (address) {
      // Create or update address
      if (user.address.length === 0) {
        // If user doesn't have an address, create a new one
        updatedAddress = new Address(address);
        await updatedAddress.save();
        user.address.push(updatedAddress._id);
      } else {
        // If user has an address, update the existing one
        const existingAddress = await Address.findById(user.address[0]);
        Object.assign(existingAddress, address); // Update address fields
        updatedAddress = await existingAddress.save();
      }
    }

    // Hash password if provided
    const hashedPassword = password ? await hashPassword(password) : undefined;

    // Update user profile using the User model
    const updatedUser = await User.findByIdAndUpdate(req.user._id, {
      name: name || user.name,
      email: email || user.email,
      password: hashedPassword || user.password,
      phone: phone || user.phone,
      gender: gender || user.gender,
      dob: dob || user.dob
    }, { new: true });

    res.status(200).send({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser ? {
        _id: updatedUser._id || null,
        name: updatedUser.name || null,
        email: updatedUser.email || null,
        phone: updatedUser.phone || null,
        gender: updatedUser.gender || null,
        dob: updatedUser.dob || null,
        address: updatedAddress ? {
          id: updatedAddress._id || null,
          Area: updatedAddress.Area || null,
          pincode: updatedAddress.pincode || null,
          landmark: updatedAddress.landmark || null,
          state: updatedAddress.state || null,
          street: updatedAddress.street || null,
          city: updatedAddress.city || null,
          country: updatedAddress.country || "India"
        } : null,
      } : null,
    });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).send({ success: false, message: 'Server Error in profile controller' });
  }
};


// get user detail
export const getUserController = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('address');
    res.status(200).send({
      success: true,
      message: 'User fetched successfully',
      user,
    });
  } catch (error) {
    console.error('Error in getUserController:', error);
    res.status(500).send({ success: false, message: 'Server Error' });
  }
}

export const addToCartController = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    let cart = await Cart.findOne({ user: userId });


    if (!cart) {
      // If user doesn't have a cart, create a new one
      cart = new Cart({ user: userId, items: [] });
    }

    // Ensure that the quantity is a valid number
    const parsedQuantity = parseInt(quantity || 1); // Default to 1 if quantity is not provided or invalid
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid quantity' });
    }

    // Check if the product is already in the cart
    const existingItemIndex = cart.items.findIndex(item => item.product._id.toString() === productId);

    if (existingItemIndex !== -1) {
      // If the product is already in the cart, update the quantity
      cart.items[existingItemIndex].quantity += parsedQuantity;
    } else {
      // If the product is not in the cart, add it as a new item
      cart.items.push({ product: productId, quantity: parsedQuantity });
    }



    // console.log(cartItems);
    // Calculate total cart item count
    cart.totalCartItem = cart.items.length;

    // Calculate total cart value based on updated cart items
    let totalCartValue = 0;

    // Iterate through each item in the cart to calculate total value
    for (const item of cart.items) {
      // Find the corresponding product details
      const productDetails = await Product.findById(item.product);

      if (productDetails) {
        // Calculate the total value of this item (quantity * price)
        const itemTotalValue = item.quantity * productDetails.price;
        totalCartValue += itemTotalValue;
      }
    }

    // Update the cart's totalCartValue property
    cart.totalCartValue = totalCartValue;

    // Save the updated cart
    await cart.save();

    // fetch all product in cart items
    const cartItems = await Promise.all(cart.items.map(async (item) => {
      const productDetails = await Product.findById(item.product);
      return {
        ...item.toObject(),
        product: productDetails
      }
    }))


    res.status(200).json({ success: true, message: 'Product added to cart successfully', cart: { items: cartItems }, totalCartItem: cart.totalCartItem, totalCartValue: cart.totalCartValue, cartId: cart._id });
  } catch (error) {
    console.error('Error adding product to cart:', error);
    res.status(500).json({ success: false, error, message: 'Error adding product to cart' });
  }
};



// increaseQuantityController.js
export const increaseQuantityController = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user ? req.user._id : null; // Check if req.user exists

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    let cart = await Cart.findOne({ user: userId })

    console.log('productId:', productId, 'userId:', userId);
    if (!cart) {
      // If user doesn't have a cart, create a new one
      cart = new Cart({ user: userId, items: [] });
    }

    // Find the item in the cart
    const existingItem = cart.items.find(item => item.product._id.toString() === productId);

    if (existingItem) {
      // If the product is already in the cart, increase the quantity
      existingItem.quantity++;
    } else {
      // If the product is not in the cart, add it as a new item with quantity 1
      cart.items.push({ product: productId, quantity: 1 });
    }

    // Calculate total cart item count
    cart.totalCartItem = cart.items.length;

    // Calculate total cart value based on updated cart items
    let totalCartValue = 0;

    // Iterate through each item in the cart to calculate total value
    for (const item of cart.items) {
      // Find the corresponding product details
      const productDetails = await Product.findById(item.product);

      if (productDetails) {
        // Calculate the total value of this item (quantity * price)
        const itemTotalValue = item.quantity * productDetails.price;
        totalCartValue += itemTotalValue;
      }
    }

    // Update the cart's totalCartValue property
    cart.totalCartValue = totalCartValue;


    // Save the updated cart
    await cart.save();
    // fetch all product in cart items
    const cartItems = await Promise.all(cart.items.map(async (item) => {
      const productDetails = await Product.findById(item.product);
      return {
        ...item.toObject(),
        product: productDetails
      }
    }))

    res.status(200).json({ success: true, message: 'Quantity increased successfully', cart: { _id: cart._id, items: cartItems }, totalCartItem: cart.totalCartItem, totalCartValue: cart.totalCartValue });
  } catch (error) {
    console.error('Error increasing quantity:', error);
    res.status(500).json({ success: false, error, message: 'Error increasing quantity' });
  }
};


// decreaseQuantityController.js
export const decreaseQuantityController = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    let cart = await Cart.findOne({ user: userId })
    let product = await Product.findById(productId);

    if (!cart) {
      // If user doesn't have a cart, return an error
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    // Find the item in the cart
    const existingItem = cart.items.find(item => item.product._id.toString() === productId);

    if (existingItem) {
      // If the product is already in the cart and its quantity is greater than 1, decrease the quantity
      if (existingItem.quantity > 1) {
        existingItem.quantity--;
      } else {
        // If the quantity is 1, remove the item from the cart
        cart.items = cart.items.filter(item => item.product._id.toString() !== productId);
      }
    } else {
      // If the product is not in the cart, return an error
      return res.status(404).json({ success: false, message: 'Product not found in cart' });
    }

    // Calculate total cart item count
    cart.totalCartItem = cart.items.length;

    // Calculate total cart value based on updated cart items
    let totalCartValue = 0;

    // Iterate through each item in the cart to calculate total value
    for (const item of cart.items) {
      // Find the corresponding product details
      const productDetails = await Product.findById(item.product);

      if (productDetails) {
        // Calculate the total value of this item (quantity * price)
        const itemTotalValue = item.quantity * productDetails.price;
        totalCartValue += itemTotalValue;
      }
    }

    // Update the cart's totalCartValue property
    cart.totalCartValue = totalCartValue;

    // Save the updated cart
    await cart.save();

    // fetch all product in cart items
    const cartItems = await Promise.all(cart.items.map(async (item) => {
      const productDetails = await Product.findById(item.product);
      return {
        ...item.toObject(),
        product: productDetails
      }
    }))

    res.status(200).json({ success: true, message: 'Quantity decreased successfully', cart: { _id: cart._id, items: cartItems }, totalCartItem: cart.totalCartItem, totalCartValue: cart.totalCartValue });
  } catch (error) {
    console.error('Error decreasing quantity:', error);
    res.status(500).json({ success: false, error, message: 'Error decreasing quantity' });
  }
};


export const removeCartProductController = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id

    console.log(productId)
    console.log(userId)

    let product = await Product.findById(productId);

    if (!userId) {
      return res.status(401).send({ success: false, message: 'User not authenticated' });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).send({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex === -1) {
      return res.status(404).send({ success: false, message: 'Product not found in cart' });
    }

    // Remove the item from the cart
    cart.items.splice(itemIndex, 1);


    // Save the updated cart
    await cart.save();

    // Calculate total cart item count
    cart.totalCartItem = cart.items.length;

    // Calculate total cart value
    cart.totalCartValue = cart.items.reduce((total, item) => total + item.quantity * product.price, 0);

    // fetch all product in cart items
    const cartItems = await Promise.all(cart.items.map(async (item) => {
      const productDetails = await Product.findById(item.product);
      return {
        ...item.toObject(),
        product: productDetails
      }
    }))

    console.log(cartItems);

    res.status(200).send({ success: true, message: 'Product removed from cart successfully', cart: { _id: cart._id, items: cartItems, totalCartItem: cart.totalCartItem, totalCartValue: cart.totalCartValue } });
  } catch (error) {
    console.error('Error removing product from cart:', error);
    res.status(500).send({ success: false, error, message: 'Error removing product from cart' });
  }
}


export const getAllUserController = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).send({
      success: true,
      message: 'Users fetched successfully',
      users,
    })

  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      error,
      message: 'Error in fetching all users',
    })

  }
}

// delete user 
export const deleteUserController = async (req, res) => {
  try {
    const userId = req.params

    // Check if the userId is valid before attempting deletion
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required for deletion',
      });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      deletedUser: user,
    });

  } catch (error) {
    console.error('Error in deleting user:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Error in deleting user',
    });
  }
};


// total count of user , product , category
export const totalCountAllController = async (req, res) => {
  try {
    const totalUser = await User.countDocuments();
    const totalProduct = await Product.countDocuments();
    const totalCategory = await Category.countDocuments();
    const totalOrder = await Order.countDocuments();
    res.status(200).send({
      success: true,
      message: 'Total count fetched successfully',
      total: {
        customer: totalUser,
        total_Product: totalProduct,
        total_category: totalCategory,
        total_order: totalOrder
      }
    })

  } catch (error) {

  }
}

// get cart item of user login

export const getCartController = async (req, res) => {
  try {
    let userId = req.user._id;
    let cart = await Cart.findOne({ user: userId });

    if (!cart || !cart.items || cart.items.length === 0) {
      res.status(200).send({
        success: true,
        message: 'Cart is empty',
        cart: { items: [], totalCartItem: 0, totalCartValue: 0 },
      })
    }
    else {
      // fetch all product in cart items
      const cartItems = await Promise.all(cart.items.map(async (item) => {
        const productDetails = await Product.findById(item.product);
        return {
          ...item.toObject(),
          product: productDetails
        }
      }))

      const totalCartItem = cartItems.length;

      cart.totalCartValue = cart.items.reduce((total, item) => total + item.quantity * item.product.price, 0);

      res.status(200).send({
        success: true,
        message: 'Cart fetched successfully',
        cart: { _id: cart._id, items: cartItems, totalCartItem, totalCartValue: cart.totalCartValue },
      })
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      error,
      message: 'Error in fetching cart',
    })
  }
}
