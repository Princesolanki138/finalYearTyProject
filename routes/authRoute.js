import express from "express";
import { registerController, testController } from "../controller/authController.js";

const router = express.Router();

// register post
router.post("/register", registerController);

router.get("/tester", testController)


export default router;
