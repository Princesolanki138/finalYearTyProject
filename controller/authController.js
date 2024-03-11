import JWT from "jsonwebtoken"
import { comparePassd, hashPassword } from "../helpers/authHelper.js"
import userModel from "../models/userModel.js"


//register controller
export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body
    //validation 
    if (!name) {
      return res.send({ message: 'Name is Required' })
    }
    if (!email) {
      return res.send({ message: 'Email is Required' })
    }
    if (!password) {
      return res.send({ message: 'Password is Required' })
    }
    if (!phone) {
      return res.send({ message: 'Phone Number is Required' })
    }
    //check user
    const existingUser = await userModel.findOne({ email })
    //existing user
    if (existingUser) {
      return res.status(200).send({
        success: false,
        message: 'Already Resgister Please Login'
      })
    }
    //register user
    const hashedPassd = await hashPassword(password)
    // save 
    const user = await new userModel({ name, email, phone, password: hashedPassd }).save()
    res.status(201).send({
      success: true,
      message: 'User Register Successfully',
      user
    })

  } catch (error) {
    console.log(error)
    res.status(500).send({
      success: false,
      message: "error in register controller",
      error
    })
  }
}

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
    const user = await userModel.findOne({ email })
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

    res.status(200).send({
      success: true,
      message: "login successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
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
