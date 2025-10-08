// routes/verificationRoutes.js
import express from "express";
import {
  getVerificationStatus,
  updateSellerVerificationStatus,
  getPendingSellerVerifications,
  skipBusinessVerification,
} from "../controllers/verificationController.js";
import userAuth, { authorizeRoles } from "../middleware/userAuth.js";

const verificationRouter = express.Router();

// User routes
verificationRouter.get("/status", userAuth, getVerificationStatus);
verificationRouter.post("/skip-business", userAuth, skipBusinessVerification);

// Admin routes
verificationRouter.get(
  "/pending-sellers",
  userAuth,
  authorizeRoles("admin"),
  getPendingSellerVerifications
);

verificationRouter.post(
  "/update-seller-status",
  userAuth,
  authorizeRoles("admin"),
  updateSellerVerificationStatus
);

export default verificationRouter;
