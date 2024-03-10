import express from "express";

const router = express.Router();

// register post
router.post("/register", registerController);

//login post
router.post("/login", loginController)





export default router;
