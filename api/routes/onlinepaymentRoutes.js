import express from "express";
import {
  createOnlinePayment,
  getOnlinePaymentById,
  deleteOnlinePayment,
  getAllOnlinePayments,
  updatePaymentStatus,
  verifyOTP,
  resendOTP
} from "../controllers/onlinepaymentController.js";

const router = express.Router();

// GET routes
router.get("/", getAllOnlinePayments);
router.get("/:id", getOnlinePaymentById);

// POST routes
router.post("/", createOnlinePayment);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);

// PUT routes
router.put("/:id/status", updatePaymentStatus);

// DELETE routes
router.delete("/:id", deleteOnlinePayment);

export default router;

