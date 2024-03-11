import express from "express";
import { loginController, registerController, testController } from "../controller/authController.js";

const router = express.Router();

// register post
router.post("/register", registerController);

//login post
router.post("/login", loginController);

// test
router.get("/tester", testController)


export default router;
