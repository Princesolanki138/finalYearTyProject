import Admin from "../models/AdminModel.js";
import User from "../models/userModel.js";
import JWT from "jsonwebtoken"

export const admintRegisterController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).send({ message: 'Admin already exists. Please login.' });
    }

    const newadmin = await Admin.create({
      name,
      email,
      password
    })

    res.status(201).send({
      success: true,
      message: 'Admin registered successfully',
      admin: newadmin
    })

  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error in admin registration',
      error
    })
  }
}

export const adminLoginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: 'Please provide email and password'
      })
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(400).send({
        success: false,
        message: 'Admin not found'
      })
    }

    if (password !== admin.password) {
      return res.status(400).send({
        success: false,
        message: 'Incorrect password'
      })
    }
    const token = await JWT.sign({ _id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    })

    res.status(200).send({
      success: true,
      message: 'Admin logged in successfully',
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        token
      }
    })

  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error in admin login',
      error
    })

  }

}