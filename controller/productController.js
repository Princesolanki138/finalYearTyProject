import productModel from "../models/productModel.js";
import { uploadCloudinary } from "../utils/cloudinaryConfig.js"

import slugify from "slugify";
import fs from "fs";

// create products
import Product from "../models/productModel.js";

export const createProductController = async (req, res) => {
  try {
    const {
      name,
      brand,
      mrp,
      price,
      modelno,
      category,
      gender,
      warranty,
      country_of_origin,
      description,
      dialcolor,
      strapColor,
    } = req.body;

    const imagesLocalPath = req.files.images[0].path;

    //console.log(imagesLocalPath)

    if (!imagesLocalPath) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    const images = await uploadCloudinary(imagesLocalPath);
    // console.log(images)

    if (!images) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    // Validate required fields
    const requiredFields = { name, brand, mrp, price, modelno, category, gender, warranty, country_of_origin, description, dialcolor, strapColor };
    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        return res.status(400).json({ error: `${key} is required` });
      }
    }

    // Validate dialcolor and strapColor arrays
    if (!Array.isArray(dialcolor) || dialcolor.length === 0 || !Array.isArray(strapColor) || strapColor.length === 0) {
      return res.status(400).json({ error: "Dialcolor and strapColor must be non-empty arrays" });
    }

    // console.log(`strapColor ${strapColor} dialcolor ${dialcolor}`)

    // Create a new product instance
    const product = new Product({
      name,
      brand,
      mrp,
      price,
      modelno,
      category,
      gender,
      warranty,
      country_of_origin,
      description,
      dialcolor,
      strapColor,
      images: images.url,
      slug: slugify(name),
    });
    //console.log(images)
    // console.log(`strapColor ${strapColor} dialcolor ${dialcolor}`)
    // Save the product to the database
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product Created Successfully',
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error,
      message: 'Error in creating product',
    });
  }
};


// get all products
export const getProductController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;

    const products = await productModel
      .find({})
      .select("-images")
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      message: 'Products fetched successfully',
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      error,
      message: 'Error in fetching products',
    });
  }
}

// get single product
export const getSingleProductController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ slug: req.params.slug })
      .select("-images")
      .populate("category");
    res.status(200).send({
      success: true,
      message: 'Product fetched successfully',
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      error,
      message: 'Error in fetching product',
    });
  }
}
//get images
export const productPhotoController = async (req, res) => {
  try {

    const product = await productModel.findById(req.params.pid).select("images");

    if (!product || !product.images || !product.images.data) {
      return res.status(404).json({ success: false, message: "Product image not found" });
    }

    res.set("Content-type", product.images.contentType);
    return res.status(200).send(product.images.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while getting images",
      error: error.message
    });
  }
};



// delete product
export const deleteProductController = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.params.pid).select("-photo");
    res.status(200).send({
      success: true,
      message: "Product Deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting product",
      error,
    });
  }
};

// update product 

export const updateProductController = async (req, res) => {
  try {
    // Ensure that req.fields is defined
    if (!req.fields) {
      return res.status(400).send({ error: 'Form data not parsed correctly' });
    }

    const { name, brand, mrp, price, modelno, category, gender, warranty, country_of_origin, description, dialcolor, strapColor } = req.fields;
    const { images } = req.files;

    // Validation code...

    switch (true) {
      case !name:
        return res.status(500).send({ error: "Name is Required" });
      case !brand:
        return res.status(500).send({ error: "Brand is Required" });
      case !mrp:
        return res.status(500).send({ error: "MRP is Required" });
      case !price:
        return res.status(500).send({ error: "Price is Required" });
      case !modelno:
        return res.status(500).send({ error: "Model No. is Required" });
      case !category:
        return res.status(500).send({ error: "Category is Required" });
      case !gender:
        return res.status(500).send({ error: "Gender is Required" });
      case !warranty:
        return res.status(500).send({ error: "Warranty is Required" });
      case !country_of_origin:
        return res.status(500).send({ error: "Country of Origin is Required" });
      case !description:
        return res.status(500).send({ error: "Description is Required" });
      case !dialcolor:
        return res.status(500).send({ error: "Dial Color is Required" });
      case !strapColor:
        return res.status(500).send({ error: "Strap Color is Required" });
      case images && images.size > 1000000:
        return res.status(500).send({ error: "Image is required and should be less then 1mb" });
    }

    const products = new productModel.findByIdAndUpdate(req.params.pid, { ...req.fields, slug: slugify(name) }, { new: true });

    if (images) {
      products.images.data = fs.readFileSync(images.path);
      products.images.contentType = images.type;
    }
    await products.save();

    res.status(201).send({
      success: true,
      message: 'Product updated Successfully',
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      success: false,
      error,
      message: 'Error in updating product',
    });
  };
};

//product filter 

export const productFilterController = async (req, res) => {
  try {
    const filter = {}
    if (req.query.brand) {
      filter.brand = req.query.brand
    }
    if (req.query.strapcolor) {
      filter.strapColor = req.query.strapcolor;
    }
    if (req.query.dialcolor) {
      filter.dialcolor = req.query.dialcolor;
    }
    if (req.query.priceRange) {
      filter.price = { $gte: priceRange[0], $lte: priceRange[1] };
    }
    const products = await productModel.find(filter);

    res.status(200).send({
      success: true,
      products,
    })
  }
  catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error WHile Filtering Products",
      error,
    })
  }
}

