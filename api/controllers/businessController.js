// controllers/businessController.js
import userModel from "../models/userModel.js";
import path from "path";
import fs from "fs";

// Upload Business Documents
export const uploadBusiness = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one business document is required",
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already approved
    if (user.businessStatus === "approved") {
      return res.status(400).json({
        success: false,
        message: "Business documents already verified and approved",
      });
    }

    // Delete old documents if they exist
    if (user.businessDocs && user.businessDocs.length > 0) {
      user.businessDocs.forEach(docPath => {
        const fullPath = path.join(process.cwd(), docPath);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      });
    }

    // Save new document paths
    const businessDocs = [];
    Object.keys(req.files).forEach(key => {
      businessDocs.push(`/uploads/business/${req.files[key][0].filename}`);
    });

    user.businessDocs = businessDocs;
    user.businessStatus = "pending";
    user.businessRejectionReason = ""; // Clear previous rejection reason

    await user.save();

    res.json({
      success: true,
      message: "Business documents uploaded successfully. Awaiting admin approval.",
      data: {
        businessDocs: user.businessDocs,
        businessStatus: user.businessStatus,
      },
    });
  } catch (error) {
    console.error("Upload Business Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload business documents",
    });
  }
};

// Get User's Business Status
export const getBusinessStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await userModel
      .findById(userId)
      .select("businessDocs businessStatus businessRejectionReason");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        businessDocs: user.businessDocs || [],
        businessStatus: user.businessStatus || 'not_uploaded',
        rejectionReason: user.businessRejectionReason || '',
      },
    });
  } catch (error) {
    console.error("Get Business Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch business status",
    });
  }
};

// Admin: Get All Pending Business Verifications
export const getPendingBusinessVerifications = async (req, res) => {
  try {
    const users = await userModel
      .find({ businessStatus: "pending" })
      .select(
        "firstName lastName email businessDocs businessStatus createdAt"
      )
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Get Pending Business Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending business verifications",
    });
  }
};

// Admin: Approve or Reject Business Documents
export const updateBusinessStatus = async (req, res) => {
  try {
    const { userId, status, rejectionReason } = req.body;

    if (!userId || !status) {
      return res.status(400).json({
        success: false,
        message: "User ID and status are required",
      });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'approved' or 'rejected'",
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.businessStatus = status;

    // If rejected, store the reason
    if (status === "rejected" && rejectionReason) {
      user.businessRejectionReason = rejectionReason;
    } else if (status === "approved") {
      user.businessRejectionReason = ""; // Clear rejection reason on approval
    }

    await user.save();

    res.json({
      success: true,
      message: `Business documents ${status} successfully`,
      data: {
        userId: user._id,
        businessStatus: user.businessStatus,
      },
    });
  } catch (error) {
    console.error("Update Business Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update business status",
    });
  }
};


