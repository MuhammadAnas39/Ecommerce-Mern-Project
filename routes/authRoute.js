import express from "express";
import {
  adminOrderController,
  forgotPassword,
  getAllUserController,
  loginController,
  orderStatusController,
  registerController,
  updateProfileController,
  userOrderController,
  userRoleController,
} from "../controllers/authController.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ------REGISTER-------
router.post("/register", registerController);
router.post("/login", loginController);
router.post("/forgot-password", forgotPassword);

router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});
router.put("/profile", requireSignIn, updateProfileController);
router.get("/get-all-users", requireSignIn, isAdmin, getAllUserController);
router.put(
  "/change-user-role/:userId",
  requireSignIn,
  isAdmin,
  userRoleController
);

router.get("/orders", requireSignIn, userOrderController);
router.get("/all-orders", requireSignIn, isAdmin, adminOrderController);
router.put(
  "/order-status/:orderId",
  requireSignIn,
  isAdmin,
  orderStatusController
);

export default router;
