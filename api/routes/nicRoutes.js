// routes/nicRoutes.js
import express from "express";
import {
  uploadNIC,
  getNICStatus,
  getPendingNICVerifications,
  updateNICStatus,
} from "../controllers/nicVerificationController.js";
import userAuth, { authorizeRoles } from "../middleware/userAuth.js";
import upload from "../middleware/uploadMiddleware.js";

const nicRouter = express.Router();

// User routes
nicRouter.post(
  "/upload",
  userAuth,
  upload.fields([
    { name: "nicFront", maxCount: 1 },
    { name: "nicBack", maxCount: 1 },
  ]),
  uploadNIC
);

nicRouter.get("/status", userAuth, getNICStatus);

// Admin routes
nicRouter.get(
  "/pending",
  userAuth,
  authorizeRoles("admin"),
  getPendingNICVerifications
);

nicRouter.post(
  "/update-status",
  userAuth,
  authorizeRoles("admin"),
  updateNICStatus
);

export default nicRouter;