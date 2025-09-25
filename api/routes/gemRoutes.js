import express from "express";
import {
  createGem,
  getGems,
  getGemById,
  approveGem,
} from "../controllers/gemController.js";
import userAuth, { authorizeRoles } from "../middleware/userAuth.js";

const router = express.Router();

router.get("/", getGems);
router.get("/:id", getGemById);
router.post("/create-gem", userAuth, authorizeRoles("seller"), createGem);
router.put("/approve/:id", userAuth, authorizeRoles("admin"), approveGem);

export default router;
