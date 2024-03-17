import express from "express";
import { loginController, registerController, testController, updateProfile }
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
  res.status(200).send({ ok: true });
  console.log("ok")
});

//update user profile
router.put("/update-user", requireSignIn, updateProfile);

export default router;
