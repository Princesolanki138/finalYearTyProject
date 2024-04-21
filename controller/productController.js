import productModel from "../models/productModel.js";
import { uploadCloudinary, } from "../utils/cloudinaryConfig.js"
import slugify from "slugify";


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

    console.log("req.body", req.body)

    // Check if any files were uploaded
    if (!req.files || !req.files.images || req.files.images.length === 0) {
      return res.status(400).json({ error: "No images uploaded" });
    }

    const imagesLocalPaths = req.files.images.map(images => images.path);

    let imagesUrls;
    try {
      // Upload images to Cloudinary
      imagesUrls = await uploadCloudinary(imagesLocalPaths);
    } catch (uploadError) {
      console.error("Error uploading images:", uploadError);
      return res.status(500).json({ error: "Error uploading images" });
    }

    console.log(imagesUrls)

    // Validate required fields
    // const requiredFields = { name, brand, mrp, price, modelno, category, gender, warranty, country_of_origin, description, dialcolor, strapColor };
    // for (const [key, value] of Object.entries(requiredFields)) {
    //   if (!value) {
    //     return res.status(400).json({ error: `${key} is required` });
    //   }
    // }

    // Validate dialcolor and strapColor arrays
    // if (!Array.isArray(dialcolor) || dialcolor.length === 0 || !Array.isArray(strapColor) || strapColor.length === 0) {
    //   return res.status(400).json({ error: "Dialcolor and strapColor must be non-empty arrays" });
    // }

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
      images: imagesUrls,
      slug: slugify(name),
    });

    console.log(product)
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
      // .select("-images")
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
      // .select("-images")
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
//get images (this is optional api )
export const productPhotoController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("images");

    if (!product || !product.images) {
      return res.status(404).json({ success: false, message: "Product image not found" });
    }

    // Directly redirect to the Cloudinary image URL
    return res.redirect(product.images);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while getting product image",
      error: error.message
    });
  }
};


// delete product
export const deleteProductController = async (req, res) => {
  try {
    const deletedProduct = await productModel.findByIdAndDelete(req.params.pid);
    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while deleting product",
      error: error.message, // Include error message in response for debugging
    });
  }
};

// update product 

export const updateProductController = async (req, res) => {
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

    // Create update object
    const updateObj = {
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
    };

    // Add slug if name exists
    if (name) {
      updateObj.slug = slugify(name);
    }

    // Check if images are uploaded
    if (req.files && req.files.images) {
      const imagesLocalPaths = req.files.images.map(image => image.path);
      const images = await uploadCloudinary(imagesLocalPaths);
      if (!images) {
        return res.status(400).json({ error: "Error uploading images" });
      }
      // Add images URLs to update object
      updateObj.images = images;
    }

    // Update the product in the database
    const updatedProduct = await Product.findByIdAndUpdate(req.params.pid, updateObj, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json({
      success: true,
      message: 'Product Updated Successfully',
      product: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error,
      message: 'Error while updating product',
    });
  }
};



//product filter 

export const productFilterController = async (req, res) => {
  try {
    const filter = {}
    if (req.query.category) {
      filter.category = req.query.category

    }
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
    const products = await productModel.find(filter).populate("category");

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


export const searchProductController = async (req, res) => {
  try {
    const query = req.query.q;
    const products = await productModel.find({
      $or: [{
        name: { $regex: query, $options: "i" }
      },
      { modelno: { $regex: query, $options: "i" } },
      { brand: { $regex: query, $options: "i" } },
      ]
    })

    if (products.length < 1) {
      return res.status(200).json({
        success: false,
        products: []
      })
    }

    res.status(200).send({
      success: true,
      products,
    })
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error While Searching Products",
      error,
    })
  }
}
