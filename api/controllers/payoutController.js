import payoutModel from "../models/payoutModel.js";
import userModel from "../models/userModel.js";

// Setup payout method
export const setupPayout = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    const {
      payoutMethod,
      bankName,
      accountNumber,
      accountHolderName,
      branchCode,
      swiftCode,
      mobileProvider,
      mobileNumber,
      accountName,
    } = req.body;

    // Validate required fields based on payout method
    if (payoutMethod === "bank_account") {
      if (!bankName || !accountNumber || !accountHolderName) {
        return res.json({
          success: false,
          message: "Please provide all required bank account details",
        });
      }
    } else if (payoutMethod === "mobile_money") {
      if (!mobileProvider || !mobileNumber || !accountName) {
        return res.json({
          success: false,
          message: "Please provide all required mobile money details",
        });
      }
    } else {
      return res.json({
        success: false,
        message: "Invalid payout method",
      });
    }

    // Check if payout already exists
    let payout = await payoutModel.findOne({ userId });

    if (payout) {
      // Update existing payout
      payout.payoutMethod = payoutMethod;
      
      if (payoutMethod === "bank_account") {
        payout.bankName = bankName;
        payout.accountNumber = accountNumber;
        payout.accountHolderName = accountHolderName;
        payout.branchCode = branchCode || "";
        payout.swiftCode = swiftCode || "";
        // Clear mobile money fields
        payout.mobileProvider = undefined;
        payout.mobileNumber = undefined;
        payout.accountName = undefined;
      } else {
        payout.mobileProvider = mobileProvider;
        payout.mobileNumber = mobileNumber;
        payout.accountName = accountName;
        // Clear bank account fields
        payout.bankName = undefined;
        payout.accountNumber = undefined;
        payout.accountHolderName = undefined;
        payout.branchCode = undefined;
        payout.swiftCode = undefined;
      }
      
      await payout.save();
    } else {
      // Create new payout
      const payoutData = {
        userId,
        payoutMethod,
      };

      if (payoutMethod === "bank_account") {
        payoutData.bankName = bankName;
        payoutData.accountNumber = accountNumber;
        payoutData.accountHolderName = accountHolderName;
        payoutData.branchCode = branchCode || "";
        payoutData.swiftCode = swiftCode || "";
      } else {
        payoutData.mobileProvider = mobileProvider;
        payoutData.mobileNumber = mobileNumber;
        payoutData.accountName = accountName;
      }

      payout = await payoutModel.create(payoutData);
    }

    // IMPORTANT: Mark payout as completed in user model
    await userModel.findByIdAndUpdate(userId, {
      payoutStatus: "completed",
    });

    res.json({
      success: true,
      message: "Payout method setup successfully",
      data: payout,
    });
  } catch (error) {
    console.error("Setup payout error:", error);
    res.json({
      success: false,
      message: error.message || "Failed to setup payout method",
    });
  }
};

// Get payout details
export const getPayoutDetails = async (req, res) => {
  try {
    const userId = req.user.id;

    const payout = await payoutModel.findOne({ userId });

    if (!payout) {
      return res.json({
        success: true,
        data: null,
      });
    }

    res.json({
      success: true,
      data: payout,
    });
  } catch (error) {
    console.error("Get payout details error:", error);
    res.json({
      success: false,
      message: error.message || "Failed to fetch payout details",
    });
  }
};