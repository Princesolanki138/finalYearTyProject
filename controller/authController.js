import { hashPassword } from "../helpers/authHelper.js"
import userModel from "../models/userModel.js"

export const registerController = async (req, res) => {
  try {
    console.log(req.body)
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
      message: "error in Registration",
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
