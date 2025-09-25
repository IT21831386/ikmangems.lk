import express from "express";
import { placeBid, getBidsByGem } from "../controllers/bidController.js";
import userAuth, { authorizeRoles } from "../middleware/userAuth.js";

const router = express.Router();

router.post("/", userAuth, authorizeRoles("buyer"), placeBid);
router.get("/:gemId", getBidsByGem);

export default router;
