import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";

//Protected Routes token base
const requireSignIn = async (req, res, next) => {
  try {
    const decode = JWT.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    req.user = decode;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Please Login To Access This Page",
      error,
    });
  }
};

export default requireSignIn
