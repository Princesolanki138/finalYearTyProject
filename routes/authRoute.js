import express from "express";
import { addToCartController, decreaseQuantityController, getUserController, increaseQuantityController, loginController, registerController, removeCartProductController, testController, updateProfile }
  from "../controller/authController.js";
import requireSignIn from "../middleware/authMiddleware.js"
import { searchProductController } from "../controller/productController.js";


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

router.post("/add-to-cart", requireSignIn, addToCartController)

router.post('/cart-increase-quantity', requireSignIn, increaseQuantityController);

router.post('/cart-decrease-quantity', requireSignIn, decreaseQuantityController);

router.post('/remove-from-cart', requireSignIn, removeCartProductController);

router.get("/search", requireSignIn, searchProductController);


export default router;
