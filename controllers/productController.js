import fs from "fs";
import productModel from "../models/productModel.js";
import orderModel from "../models/orderModel.js";
import braintree from "braintree";
import dotenv from "dotenv";

dotenv.config();

var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

export const createProductController = async (req, res) => {
  try {
    const { name, description, price, category, qty, shipping } = req.fields;
    const { photo } = req.files;

    const products = new productModel({ ...req.fields });
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(201).send({
      success: true,
      message: "product created successfully",
      products,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "error in create product",
      error: error.message,
    });
  }
};
export const updateProductController = async (req, res) => {
  try {
    const { name, description, price, category, qty, shipping } = req.fields;
    const { photo } = req.files;

    const products = await productModel.findByIdAndUpdate(
      req.params.pid,
      { ...req.fields },
      { new: true }
    );
    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);
      products.photo.contentType = photo.type;
    }
    await products.save();
    res.status(201).send({
      success: true,
      message: "product updated successfully",
      products,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "error in create product",
      error: error.message,
    });
  }
};

export const getAllProductsController = async (req, res) => {
  try {
    const products = await productModel
      .find()
      .populate("category")
      .select("-photo")
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      total: products.length,
      products,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "error in getting products",
      error: error.message,
    });
  }
};

export const getSingleProductController = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ name: req.params.name })
      .select("-photo")
      .populate("category");
    res.status(200).send({
      success: true,
      message: "getting single product successfully",
      product,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "error in getting single product",
      error: error.message,
    });
  }
};

export const productPhotoController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid).select("photo");

    if (product.photo.data) {
      res.set("Content-type", product.photo.contentType);
      res.status(200).send(product.photo.data);
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "error in getting product photo",
      error: error.message,
    });
  }
};

export const deleteProductController = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.params.pid).select("-photo");
    res.status(200).send({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "error in delete product",
      error: error.message,
    });
  }
};

export const productFiltersController = async (req, res) => {
  try {
    const { check, radio } = req.body;

    let args = {};
    if (check.length > 0) args.category = check;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    console.log(args);
    const product = await productModel.find(args).select("-photo");

    res.status(200).send({ success: true, product, args });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "error in filter product",
      error: error.message,
    });
  }
};

export const braintreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};
export const braintreePaymentController = async (req, res) => {
  try {
    const { cart, nonce } = req.body;
    let total = 0;
    cart.map((item) => {
      total += item.price;
    });

    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          const order = new orderModel({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          res.json({ ok: true });
        } else {
          res.status(500).send(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};
