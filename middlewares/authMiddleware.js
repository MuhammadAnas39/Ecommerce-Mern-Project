import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

export const requireSignIn = async (req, res, next) => {
  try {
    const decode = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    req.user = decode;
    next();
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "error in getting token",
    });
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id);
    console.log(user);
    if (user.role === "user") {
      return res.status(401).send({
        success: false,
        message: "Unauthorized access",
        error,
      });
    } else {
      return next();
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "error in admin middleware",
      error,
    });
  }
};
