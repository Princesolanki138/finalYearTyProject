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

    res.status(201).send({
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

    //token
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    // console.log(token)

    res.status(200).json({
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
          country: address.country || null
        } : null
      },
      cart: {
        CartId: cart ? cart._id : null,
        Cartitems: cart ? cart.items : null,
      },
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
    const { name, email, password, addressData, phone, gender, dob } = req.body;
    const user = await User.findById(req.user._id);

    if (password && password.length < 6) {
      return res.status(400).json({ error: "Password is required and must be at least 6 characters long" });
    }

    let updatedAddress;
    if (addressData) {
      // Create or update address
      if (user.address.length === 0) {
        // If user doesn't have an address, create a new one
        updatedAddress = await Address.create(addressData);
        user.address.push(updatedAddress._id);
      } else {
        // If user has an address, update the existing one
        updatedAddress = await Address.findByIdAndUpdate(user.address[0], addressData, { new: true });
      }
    }
    console.log("addressData", addressData)
    // Hash password if provided
    const hashedPassword = password ? await hashPassword(password) : undefined;

    // Update user profile using the User model
    const updatedUser = await User.findByIdAndUpdate(req.user._id, {
      name: name || user.name,
      email: email || user.email,
      password: hashedPassword || user.password,
      phone: phone || user.phone,
      // address: updatedAddress ? [updatedAddress._id] : user.address,
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
      } : null,
      address: updatedAddress ? {
        id: updatedAddress._id || null,
        Area: updatedAddress.Area || null,
        pincode: updatedAddress.pincode || null,
        landmark: updatedAddress.landmark || null,
        state: updatedAddress.state || null,
        street: updatedAddress.street || null,
        city: updatedAddress.city || null,
        country: updatedAddress.country || "India"
      } : null
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
    const { productId } = req.body;
    const userId = req.user._id;

    let cart = await Cart.findOne({ user: userId }).populate("user");

    if (!cart) {
      // If user doesn't have a cart, create a new one
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if the product is already in the cart
    const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId);


    if (existingItemIndex !== -1) {
      // If the product is already in the cart, update the quantity
      res.send({
        message: "product already in cart"
      })
    } else {
      // If the product is not in the cart, add it as a new item
      cart.items.push({ product: productId });
    }

    await cart.save();

    res.status(200).json({ success: true, message: 'Product added to cart successfully', cart });
  } catch (error) {
    console.error('Error adding product to cart:', error);
    res.status(500).json({ success: false, error, message: 'Error adding product to cart' });
  }
};
