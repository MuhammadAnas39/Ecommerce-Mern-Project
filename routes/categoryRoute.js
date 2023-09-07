import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import {
  createCategoryController,
  deleteCategory,
  getAllCategories,
  getSingleCategory,
  updateCategoryController,
} from "../controllers/categoryController.js";

const router = express.Router();

router.post(
  "/create-category",
  requireSignIn,
  isAdmin,
  createCategoryController
);

router.put(
  "/update-category/:id",
  requireSignIn,
  isAdmin,
  updateCategoryController
);

router.get("/get-all-categories", getAllCategories);
router.get("/get-category/:name", getSingleCategory);
router.delete("/delete-category/:id", requireSignIn, isAdmin, deleteCategory);

export default router;
