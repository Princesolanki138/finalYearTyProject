import express from "express"
import { createProductController, deleteProductController, getProductController, getSingleProductController, productFilterController, productPhotoController, updateProductController } from "../controller/productController.js"
import { upload } from "../middleware/multer.middleware.js"
import requireSignIn, { isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router()

//create product  
router.post("/create-product",
  upload.fields([
    { name: "images", maxCount: 4 },
  ]),
  requireSignIn,
  createProductController
);

//get all products
router.get("/get-product", getProductController)

//get single product
router.get("/get-single-product/:slug", getSingleProductController)

//get images optional do not use this api
router.get("/get-product-images/:pid", productPhotoController)

//delete product
router.delete("/delete-product/:pid", requireSignIn, isAdmin, deleteProductController)

// update product 
router.put("/update-product/:pid", upload.fields([
  { name: "images", maxCount: 4 },
]), requireSignIn, isAdmin, updateProductController)

// filter product
router.get("/product-filters", productFilterController);
export default router
