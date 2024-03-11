import productModel from "../models/productModel.js";

import slugify from "slugify";
import fs from "fs";

// create products
export const createProductController = async (req, res) => {
  try {
    const { name, brand, mrp, price, modelno, category, gender, warranty, country_of_origin, description, dialcolor, strapColor } = req.fields;
    const { images } = req.files;

    // Validation 
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

    const products = new productModel({ ...req.fields, slug: slugify(name) });

    if (images) {
      products.images.data = fs.readFileSync(images.path);
      products.images.contentType = images.type;
    }

    await products.save();

    res.status(201).send({
      success: true,
      message: 'Product Created Successfully',
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
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