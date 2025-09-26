import express from 'express';
import {
  isAuthenticated,
  register,
  resetPassword,
  sendResetOtp,
  sendVerifyOtp,
  verifyEmail,
  verifyResetOtp, 
} from '../controllers/authController.js';

import { sendCustomEmail, sendBulkEmail, verifyToken } from "../controllers/authController.js";

import { login } from '../controllers/authController.js';
import { logout } from '../controllers/authController.js';
import userAuth from '../middleware/userAuth.js';

const authRouter = express.Router();

// Public routes
authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/send-reset-otp', sendResetOtp);
authRouter.post('/verify-reset-otp', verifyResetOtp); // ✅ verify OTP before reset
authRouter.post('/reset-password', resetPassword);

// Authenticated routes
authRouter.post('/send-verify-otp', userAuth, sendVerifyOtp);
authRouter.post('/verify-account', userAuth, verifyEmail);
authRouter.get('/is-auth', isAuthenticated);

authRouter.post("/send-email", verifyToken, sendCustomEmail);
authRouter.post("/send-bulk-email", verifyToken, sendBulkEmail);

export default authRouter;









