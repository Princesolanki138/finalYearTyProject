import express from "express";
import {
  resetPassword,
  ForgetPasssword,
  ForgetPassswordOtpChecked, addToCartController, decreaseQuantityController, getCartController, getUserController, increaseQuantityController, loginController, registerController, removeCartProductController, testController, updateProfile
}
  from "../controller/authController.js";
import requireSignIn from "../middleware/authMiddleware.js"
import { searchProductController } from "../controller/productController.js";
import { createOrder, getOrderOfUser, orderpaymentVerify, rozarpayCreateOrder } from "../controller/orderController.js";


const router = express.Router();

// register post
router.post("/register", registerController);

//login post
router.post("/login", loginController);

// test
router.get("/tester", requireSignIn, testController)

router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ success: true, message: "User Authenticated", user: req.user });
});

//update user profile
router.put("/update-user", requireSignIn, updateProfile);

//get user profile
router.get("/profile", requireSignIn, getUserController);

//this api sent otp to the user register email address
router.post("/forget-password", ForgetPasssword);

//and this api verify that user enter OTP
router.post("/forget-password-otp-check", ForgetPassswordOtpChecked);

// After verify user can change password
router.put("/reset-password", resetPassword);

router.post("/add-to-cart", requireSignIn, addToCartController)

router.post('/cart-increase-quantity', requireSignIn, increaseQuantityController);

router.post('/cart-decrease-quantity', requireSignIn, decreaseQuantityController);

router.post('/remove-from-cart', requireSignIn, removeCartProductController);

router.get("/all-items", requireSignIn, getCartController);

router.get("/search", searchProductController);

// order routes

router.post("/create-order", requireSignIn, createOrder);

router.get("/get-order/:id", requireSignIn, getOrderOfUser);

router.post("/create-rozarpay-order", rozarpayCreateOrder);
router.post("/verify-order", orderpaymentVerify);

export default router;
