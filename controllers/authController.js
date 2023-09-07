import { comparePassword, hashPassword } from "../helpers/authHelper.js";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";

export const registerController = async (req, res) => {
  try {
    const existingUser = await userModel.findOne({ email: req.body.email });
    if (existingUser) {
      res.status(200).send({
        success: false,
        message: "User already exist",
      });
    }
    const hashedPassword = await hashPassword(req.body.password);
    const newUser = await userModel({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      phone: req.body.phone,
      address: req.body.address,
      answer: req.body.answer,
    }).save();

    res.status(201).send({
      success: true,
      message: "User Register successfully",
      newUser,
    });
  } catch (error) {
    res.status(500).send({
      success: "false",
      message: "error in register",
      error,
    });
  }
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(404).send({
        success: false,
        message: "Invalid email and password",
      });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "user not found",
      });
    }
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(401).send({
        success: false,
        message: "password doesn't match",
      });
    }
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    res.status(201).send({
      success: true,
      message: "login successfully",
      user: {
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        phone: user.phone,
      },
      token,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in login",
      error: error.message,
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;
    const user = await userModel.findOne({ email, answer });
    if (!user) {
      res.status(404).send({
        success: false,
        message: "wrong email and answer",
      });
    }
    const hashed = await hashPassword(newPassword);
    await userModel.findByIdAndUpdate(user._id, { password: hashed });
    res.status(200).send({
      success: true,
      message: "password reset successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "something went wrong in forgot password",
      error,
    });
  }
};

export const updateProfileController = async (req, res) => {
  try {
    const { name, email, password, address } = req.body;
    const user = await userModel.findById(req.user._id);

    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        address: address || user.address,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "profile updated successfullly",
      updatedUser,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "error in filter product",
      error: error.message,
    });
  }
};

export const userOrderController = async (req, res) => {
  try {
    const order = await orderModel
      .find({ buyer: req.user._id })
      .populate("products", "-photo")
      .populate("buyer", "name");
    res.json({ order });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "error in getting order",
      error: error.message,
    });
  }
};

export const adminOrderController = async (req, res) => {
  try {
    const order = await orderModel
      .find({})
      .populate("products", "-photo")
      .populate("buyer", "name")
      .sort({ createdAt: "-1" });
    res.json({ length: order.length, order });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "error in getting all orders",
      error: error.message,
    });
  }
};

export const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    res.status(200).json(order);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "error in chagne status order",
      error: error.message,
    });
  }
};

export const getAllUserController = async (req, res) => {
  try {
    const user = await userModel.find({}).select("-password");
    res.json({ user });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "error in getting users",
      error: error.message,
    });
  }
};

export const userRoleController = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await userModel.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true }
    );
    res.status(200).send({ user });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "error in update user role",
      error: error.message,
    });
  }
};
