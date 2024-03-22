import express from "express";
import { addToCartController, getUserController, loginController, registerController, testController, updateProfile }
  from "../controller/authController.js";
import requireSignIn from "../middleware/authMiddleware.js"


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

export default router;
