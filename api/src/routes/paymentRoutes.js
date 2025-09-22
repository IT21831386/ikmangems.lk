import express from "express";
import upload from "../middleware/upload.js";
import {
  createPayment,
  getPaymentById,
  deletePayment,
  getAllPayments,
  updatePayment,
  getPaymentHistory,
} from "../controllers/paymentController.js";

const router = express.Router();

router.get("/", getAllPayments);
router.get("/history", getPaymentHistory);
router.get("/:id", getPaymentById);
router.post("/", upload.single('slip'), createPayment);
router.post("/upload-slip", upload.single('slip'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No slip image provided" });
    }
    
    // Return the file path/URL
    res.status(200).json({
      message: "Slip image uploaded successfully",
      slipUrl: `/uploads/${req.file.filename}`,
      filename: req.file.filename
    });
  } catch (error) {
    console.error("Slip upload error:", error);
    res.status(500).json({ message: "Slip upload failed" });
  }
});
router.put("/:id", updatePayment);
router.delete("/:id", deletePayment);

export default router;
