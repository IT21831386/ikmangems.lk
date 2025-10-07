import express from "express";
import {
  createOnlinePayment,
  getOnlinePaymentById,
  deleteOnlinePayment,
  getAllOnlinePayments,
  updatePaymentStatus,
  completePayment,
  verifyOTP,
  resendOTP,
  testServer,
  //testTextLK,
  //testSMS,
  //testSMSSimple,
  testEmail,
  softDeleteOnlinePayment
} from "../controllers/onlinepaymentController.js";

const router = express.Router();

// GET routes
router.get("/", getAllOnlinePayments);
router.get("/test-server", testServer);
//router.get("/test-textlk", testTextLK);
//router.get("/test-sms/:phoneNumber", testSMSSimple);
router.get("/:id", getOnlinePaymentById);

// POST routes
router.post("/", createOnlinePayment);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
//router.post("/test-sms", testSMS);
router.post("/test-email", testEmail);

// PUT routes
router.put("/:id/status", updatePaymentStatus);
router.put("/:id/complete", completePayment);
router.put("/:id/delete", softDeleteOnlinePayment);

// DELETE routes
router.delete("/:id", deleteOnlinePayment);

export default router;

