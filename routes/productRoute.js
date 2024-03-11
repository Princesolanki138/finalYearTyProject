import express from "express"
import { createProductController, getProductController } from "../controller/productController.js"
import ExpressFormidable from "express-formidable"

const router = express.Router()

//create product
router.post("/create-product",
  ExpressFormidable(),
  createProductController)

//get all products
router.get("/get-product", getProductController)

export default router