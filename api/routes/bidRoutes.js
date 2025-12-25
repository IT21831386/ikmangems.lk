import express from "express";
import {
  placeBid,
  getBidsByGem,
  getBidsByUser,
  getAllBids,
} from "../controllers/bidController.js";
import userAuth, { authorizeRoles } from "../middleware/userAuth.js";

const router = express.Router();

router.post("/", userAuth, authorizeRoles("buyer"), placeBid);
router.get("/all", getAllBids);

router.get("/:gemId", getBidsByGem);
router.get("/my-bids", getBidsByUser);

export default router;
