import express from "express";
import { categoryController, createCategoryController, singleCategoryController } from "../controller/categoryController.js";
import requireSignIn, { isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/createCategory", requireSignIn, isAdmin, createCategoryController);

router.get("/get-category", categoryController);

router.get("/single-category/:slug", singleCategoryController);

export default router