import express from "express";
import { sendOTP, verifyOTP } from "../controllers/otpController.js";

const router = express.Router();

// Send OTP
router.post("/send", sendOTP);

// Verify OTP
router.post("/verify", verifyOTP);

export default router;
