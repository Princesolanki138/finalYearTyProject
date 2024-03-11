import express from "express";
import { categoryController, createCategoryController, singleCategoryController } from "../controller/categoryController.js";

const router = express.Router();

router.post("/createCategory", createCategoryController);

router.get("/get-category", categoryController);

router.get("/single-category/:slug", singleCategoryController);

export default router