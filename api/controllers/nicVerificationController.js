// controllers/nicController.js
import userModel from "../models/userModel.js";
import path from "path";
import fs from "fs";

// Upload NIC Images
export const uploadNIC = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.files || !req.files.nicFront || !req.files.nicBack) {
      return res.status(400).json({
        success: false,
        message: "Both NIC front and back images are required",
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
    if (user.nicStatus === "approved") {
      return res.status(400).json({
        success: false,
        message: "NIC already verified and approved",
      });
    }

    // Delete old images if they exist
    if (user.nicFrontImage) {
      const oldFrontPath = path.join(process.cwd(), user.nicFrontImage);
      if (fs.existsSync(oldFrontPath)) fs.unlinkSync(oldFrontPath);
    }
    if (user.nicBackImage) {
      const oldBackPath = path.join(process.cwd(), user.nicBackImage);
      if (fs.existsSync(oldBackPath)) fs.unlinkSync(oldBackPath);
    }

    // Save new image paths
    user.nicFrontImage = `/uploads/nic/${req.files.nicFront[0].filename}`;
    user.nicBackImage = `/uploads/nic/${req.files.nicBack[0].filename}`;
    user.nicStatus = "pending";

    await user.save();

    res.json({
      success: true,
      message: "NIC images uploaded successfully. Awaiting admin approval.",
      data: {
        nicFrontImage: user.nicFrontImage,
        nicBackImage: user.nicBackImage,
        nicStatus: user.nicStatus,
      },
    });
  } catch (error) {
    console.error("Upload NIC Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload NIC images",
    });
  }
};

// Get User's NIC Status
export const getNICStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await userModel
      .findById(userId)
      .select("nicFrontImage nicBackImage nicStatus");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        nicFrontImage: user.nicFrontImage,
        nicBackImage: user.nicBackImage,
        nicStatus: user.nicStatus,
      },
    });
  } catch (error) {
    console.error("Get NIC Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch NIC status",
    });
  }
};

// Admin: Get All Pending NIC Verifications
export const getPendingNICVerifications = async (req, res) => {
  try {
    const users = await userModel
      .find({ nicStatus: "pending" })
      .select(
        "firstName lastName email nicFrontImage nicBackImage nicStatus createdAt"
      )
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Get Pending NICs Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending verifications",
    });
  }
};

// Admin: Approve or Reject NIC
export const updateNICStatus = async (req, res) => {
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

    user.nicStatus = status;

    // If rejected, you might want to store the reason
    if (status === "rejected" && rejectionReason) {
      // You could add a rejectionReason field to the schema if needed
      user.nicRejectionReason = rejectionReason;
    }

    await user.save();

    res.json({
      success: true,
      message: `NIC ${status} successfully`,
      data: {
        userId: user._id,
        nicStatus: user.nicStatus,
      },
    });
  } catch (error) {
    console.error("Update NIC Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update NIC status",
    });
  }
};