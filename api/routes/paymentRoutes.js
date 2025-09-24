import express from "express";
import upload from "../middleware/upload.js";
import {
  createPayment,
  getPaymentById,
  deletePayment,
  getAllPayments,
  updatePayment,
  getPaymentHistory,
  updatePaymentStatus,
} from "../controllers/paymentController.js";

const router = express.Router();

router.get("/", getAllPayments);
router.get("/history", getPaymentHistory);
router.get("/:id", getPaymentById);
router.post("/", upload.single("slip"), createPayment);
router.put("/:id", updatePayment);
router.put("/:id/status", updatePaymentStatus);
router.delete("/:id", deletePayment);

export default router;