// controllers/verificationController.js
import userModel from "../models/userModel.js";
import payoutModel from "../models/payoutModel.js";

// Get User's Complete Verification Status
export const getVerificationStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await userModel.findById(userId).select(
      "nicStatus businessStatus registrationPaymentStatus sellerVerificationStatus nicFrontImage nicBackImage"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check payout status from payout model
    const payout = await payoutModel.findOne({ userId });
    const payoutStatus = payout ? 'completed' : 'not_completed';

    res.json({
      success: true,
      data: {
        nicStatus: user.nicStatus || 'not_uploaded',
        businessStatus: user.businessStatus || 'not_uploaded',
        payoutStatus: payoutStatus,
        registrationPaymentStatus: user.registrationPaymentStatus || 'unpaid',
        sellerVerificationStatus: user.sellerVerificationStatus || 'not_started',
        nicFrontImage: user.nicFrontImage,
        nicBackImage: user.nicBackImage,
      },
    });
  } catch (error) {
    console.error("Get Verification Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch verification status",
    });
  }
};

// Update Seller Verification Status (Admin only)
export const updateSellerVerificationStatus = async (req, res) => {
  try {
    const { userId, status, notes } = req.body;

    if (!userId || !status) {
      return res.status(400).json({
        success: false,
        message: "User ID and status are required",
      });
    }

    if (!["verified", "rejected", "in_review"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'verified', 'rejected', or 'in_review'",
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.sellerVerificationStatus = status;
    
    if (notes) {
      user.verificationNotes = notes;
    }

    await user.save();

    res.json({
      success: true,
      message: `Seller verification status updated to ${status}`,
      data: {
        userId: user._id,
        sellerVerificationStatus: user.sellerVerificationStatus,
      },
    });
  } catch (error) {
    console.error("Update Seller Verification Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update seller verification status",
    });
  }
};

// Get All Pending Seller Verifications (Admin only)
export const getPendingSellerVerifications = async (req, res) => {
  try {
    const users = await userModel
      .find({ 
        sellerVerificationStatus: "in_review",
        nicStatus: "approved" // Only show users with approved NIC
      })
      .select(
        "firstName lastName email nicStatus businessStatus registrationPaymentStatus sellerVerificationStatus createdAt"
      )
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Get Pending Seller Verifications Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending seller verifications",
    });
  }
};

// Skip Business Verification
export const skipBusinessVerification = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.businessStatus = "skipped";
    await user.save();

    res.json({
      success: true,
      message: "Business verification skipped successfully",
      data: {
        businessStatus: user.businessStatus,
      },
    });
  } catch (error) {
    console.error("Skip Business Verification Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to skip business verification",
    });
  }
};
