import express from "express";
import {
  setupPayout,
  getPayoutDetails,
} from "../controllers/payoutController.js";
import authUser from "../middleware/userAuth.js";

const payoutRouter = express.Router();

// POST /api/payout/setup - Create/update payout method
payoutRouter.post("/setup", authUser, setupPayout);

// GET /api/payout/details - Get existing payout details
payoutRouter.get("/details", authUser, getPayoutDetails);

export default payoutRouter;