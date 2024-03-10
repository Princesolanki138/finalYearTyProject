import { hashPassword } from "../helpers/authHelper"
import userModel from "../models/userModel"

export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address, answer } = req.body
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
    const user = await new userModel({ name, email, phone, address, password: hashedPassd, answer }).save()

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