import JWT from "jsonwebtoken"
import { comparePassd, hashPassword } from "../helpers/authHelper.js"
import User from "../models/userModel.js"
import Address from "../models/addressModel.js"


//register controller
export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

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
    // const newAddress = await Address.create(addressData);

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      // Save address ID in user's address array
    });

    res.status(201).send({
      success: true,
      message: 'User registered successfully',
      user: newUser,
    });
  } catch (error) {
    console.error('Error in registerController:', error);
    res.status(500).send({ success: false, message: 'Server Error' });
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
    const user = await User.findOne({ email }).populate('address')
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
    //token
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    console.log(token)

    res.status(200).send({
      success: true,
      message: "login successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address.map((address) => ({
          id: address._id,
          Area: address.Area,
          pincode: address.pincode,
          landmark: address.landmark,
          street: address.street,
          city: address.city,
          country: address.country
        }))
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
    const { name, email, password, addressData, phone } = req.body;
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

    // Hash password if provided
    const hashedPassword = password ? await hashPassword(password) : undefined;

    // Update user profile using the User model
    const updatedUser = await User.findByIdAndUpdate(req.user._id, {
      name: name || user.name,
      email: email || user.email,
      password: hashedPassword || user.password,
      phone: phone || user.phone,
    }, { new: true });

    res.status(200).send({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
      address: updatedAddress, // Send the updated address along with the user
    });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).send({ success: false, message: 'Server Error' });
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
