// routes/businessRoutes.js
import express from "express";
import {
  uploadBusiness,
  getBusinessStatus,
  getPendingBusinessVerifications,
  updateBusinessStatus,
} from "../controllers/businessController.js";
import userAuth, { authorizeRoles } from "../middleware/userAuth.js";
import upload from "../middleware/uploadMiddleware.js";

const businessRouter = express.Router();

// User routes
businessRouter.post(
  "/upload",
  userAuth,
  upload.array("businessDoc", 5), // Allow up to 5 files
  uploadBusiness
);

businessRouter.get("/status", userAuth, getBusinessStatus);

// Admin routes
businessRouter.get(
  "/pending",
  userAuth,
  authorizeRoles("admin"),
  getPendingBusinessVerifications
);

businessRouter.post(
  "/update-status",
  userAuth,
  authorizeRoles("admin"),
  updateBusinessStatus
);

export default businessRouter;


