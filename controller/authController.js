import JWT from "jsonwebtoken"
import { comparePassd, hashPassword } from "../helpers/authHelper.js"
import User from "../models/userModel.js"
import Address from "../models/addressModel.js"
import Cart from "../models/cartModel.js"
import Product from "../models/productModel.js"


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

    // Fetch cart associated with the user
    const cart = await Cart.findOne({ user: user._id });

    // // fetch all product in cart items
    // const cartItems = await Promise.all(cart.items.map(async (item) => {
    //   const productDetails = await Product.findById(item.product);
    //   return {
    //     ...item.toObject(),
    //     product: productDetails
    //   }
    // }))

    //token
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    // console.log(token)

    res.status(200).send({
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
      // cart: cartItems || null,
      token
    })

  } catch (error) {
    console.log(error)
    res.status(500).send({
      success: false,
      message: "error in login controller",
      error
    })
  }
}



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
    let product = await Product.findById(productId);


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

    // console.log(cartItems);
    // Calculate total cart item count
    cart.totalCartItem = cart.items.length;

    // Calculate total cart value
    cart.totalCartValue = cart.items.reduce((total, item) => total + item.quantity * product.price, 0);

    res.status(200).json({ success: true, message: 'Product added to cart successfully', cart: { _id: cart._id, items: cartItems }, totalCartItem: cart.totalCartItem, totalCartValue: cart.totalCartValue });
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
    let product = await Product.findById(productId);

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

    // Calculate total cart value
    cart.totalCartValue = cart.items.reduce((total, item) => total + item.quantity * product.price, 0);

    // Save the updated cart
    await cart.save();

    res.status(200).json({ success: true, message: 'Quantity increased successfully', cart: { _id: cart._id, items: cart.items } });
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

    // Calculate total cart value
    cart.totalCartValue = cart.items.reduce((total, item) => total + item.quantity * product.price, 0);

    // Save the updated cart
    await cart.save();

    res.status(200).json({ success: true, message: 'Quantity decreased successfully', cart: { _id: cart._id, items: cart.items } });
  } catch (error) {
    console.error('Error decreasing quantity:', error);
    res.status(500).json({ success: false, error, message: 'Error decreasing quantity' });
  }
};


export const removeCartProductController = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user ? req.user._id : null;

    console.log(productId)
    console.log(userId)

    let product = await Product.findById(productId);

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Product not found in cart' });
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

    res.status(200).json({ success: true, message: 'Product removed from cart successfully', cart: { _id: cart._id, items: cartItems, totalCartItem: cart.totalCartItem, totalCartValue: cart.totalCartValue } });
  } catch (error) {
    console.error('Error removing product from cart:', error);
    res.status(500).json({ success: false, error, message: 'Error removing product from cart' });
  }
}
