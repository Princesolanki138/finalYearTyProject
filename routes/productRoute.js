import express from "express"
import { createProductController, deleteProductController, getProductController, getSingleProductController, productFilterController, productPhotoController, updateProductController } from "../controller/productController.js"
import ExpressFormidable from "express-formidable"

const router = express.Router()

//create product
router.post("/create-product",
  ExpressFormidable(),
  createProductController)

//get all products
router.get("/get-product", getProductController)

//get single product
router.get("/get-single-product/:slug", getSingleProductController)

//get images
router.get("/get-product-images/:id", productPhotoController)

//delete product
router.delete("/delete-product/:pid", deleteProductController)

// update product 
router.put("/update-product/:pid", ExpressFormidable(), updateProductController)

// filter product
router.get("/product-filters", productFilterController);
export default router