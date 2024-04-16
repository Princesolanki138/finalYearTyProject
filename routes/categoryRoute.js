import express from "express";
import { categoryController, createCategoryController, deleteCategoryController, singleCategoryController, updateCategoryController } from "../controller/categoryController.js";
import requireSignIn, { isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/createCategory", requireSignIn, isAdmin, createCategoryController);

router.get("/get-category", categoryController);

router.get("/single-category/:slug", singleCategoryController);

router.put("/update-category/:slug", requireSignIn, isAdmin, updateCategoryController);

router.delete("/delete-category/:slug", requireSignIn, isAdmin, deleteCategoryController);

export default router