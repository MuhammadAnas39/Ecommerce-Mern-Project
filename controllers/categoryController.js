import categoryModel from "../models/categoryModel.js";

export const createCategoryController = async (req, res) => {
  try {
    const { name } = req.body;

    const existingCategory = await categoryModel.findOne({ name });

    if (existingCategory) {
      return res.status(401).send({
        success: false,
        message: "this category already exist",
      });
    }
    const newCategory = await new categoryModel({ name }).save();
    res.status(201).send({
      success: true,
      message: "new category created successfully",
      newCategory,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error,
      message: "error in create category",
    });
  }
};

export const updateCategoryController = async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;

    const updateCategory = await categoryModel.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "Updated successfully",
      updateCategory,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
      message: "error in update category",
    });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const allCategories = await categoryModel.find({});
    res.status(200).send({
      success: true,
      message: "getting categories successfully",
      allCategories,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
      message: "error in all category",
    });
  }
};

export const getSingleCategory = async (req, res) => {
  try {
    const { name } = req.params;

    const getSingleCat = await categoryModel.findOne({ name });
    res.status(200).send({
      success: true,
      message: "getting single category successfully",
      getSingleCat,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
      message: "error in single category",
    });
  }
};
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await categoryModel.findByIdAndDelete(id);
    res.status(200).send({
      success: true,
      message: "category deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
      message: "error in delete category",
    });
  }
};
