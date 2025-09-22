import OnlinePayment from "../models/onlinepaymentModel.js";

// Create a new online payment
export const createOnlinePayment = async (req, res) => {
  try {
    const {
      auctionId,
      amount,
      remark,
      cardType,
      cardNumber,
      expiryMonth,
      expiryYear,
      cardHolderName,
      cvvNumber,
      fullName,
      emailAddress,
      contactNumber,
      billingAddress
    } = req.body;

    // Validate required fields
    if (!auctionId || !amount || !cardNumber || !cardHolderName) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Create new online payment record
    const onlinePayment = new OnlinePayment({
      auctionId,
      amount: parseFloat(amount),
      remark,
      cardType,
      cardNumber: cardNumber.replace(/\s/g, ''), // Remove spaces
      expiryMonth,
      expiryYear,
      cardHolderName,
      cvvNumber,
      fullName,
      emailAddress,
      contactNumber,
      billingAddress,
      status: 'pending',
      otp: Math.floor(100000 + Math.random() * 900000).toString(),
      otpExpiry: new Date(Date.now() + 7 * 60 * 1000) // 7 minutes from now
    });

    await onlinePayment.save();

    res.status(201).json({
      success: true,
      message: "Online payment created successfully",
      data: {
        id: onlinePayment._id,
        otp: onlinePayment.otp, // For demo purposes - in production, send via SMS
        status: onlinePayment.status
      }
    });

  } catch (error) {
    console.error("Error creating online payment:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get all online payments
export const getAllOnlinePayments = async (req, res) => {
  try {
    const onlinePayments = await OnlinePayment.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: onlinePayments.length,
      data: onlinePayments
    });
  } catch (error) {
    console.error("Error fetching online payments:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get online payment by ID
export const getOnlinePaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const onlinePayment = await OnlinePayment.findById(id);

    if (!onlinePayment) {
      return res.status(404).json({
        success: false,
        message: "Online payment not found"
      });
    }

    res.status(200).json({
      success: true,
      data: onlinePayment
    });
  } catch (error) {
    console.error("Error fetching online payment:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Update payment status
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'verified', 'completed', 'failed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: pending, verified, completed, failed, cancelled"
      });
    }

    const onlinePayment = await OnlinePayment.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!onlinePayment) {
      return res.status(404).json({
        success: false,
        message: "Online payment not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: onlinePayment
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { paymentId, otp } = req.body;

    if (!paymentId || !otp) {
      return res.status(400).json({
        success: false,
        message: "Payment ID and OTP are required"
      });
    }

    const onlinePayment = await OnlinePayment.findById(paymentId);

    if (!onlinePayment) {
      return res.status(404).json({
        success: false,
        message: "Online payment not found"
      });
    }

    // Check if OTP has expired
    if (new Date() > onlinePayment.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one."
      });
    }

    // Verify OTP
    if (onlinePayment.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    // Update payment status to verified
    onlinePayment.status = 'verified';
    onlinePayment.verifiedAt = new Date();
    await onlinePayment.save();

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      data: {
        id: onlinePayment._id,
        status: onlinePayment.status,
        verifiedAt: onlinePayment.verifiedAt
      }
    });

  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Resend OTP
export const resendOTP = async (req, res) => {
  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "Payment ID is required"
      });
    }

    const onlinePayment = await OnlinePayment.findById(paymentId);

    if (!onlinePayment) {
      return res.status(404).json({
        success: false,
        message: "Online payment not found"
      });
    }

    // Generate new OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    onlinePayment.otp = newOtp;
    onlinePayment.otpExpiry = new Date(Date.now() + 7 * 60 * 1000); // 7 minutes from now
    await onlinePayment.save();

    res.status(200).json({
      success: true,
      message: "OTP resent successfully",
      data: {
        id: onlinePayment._id,
        otp: newOtp, // For demo purposes - in production, send via SMS
        otpExpiry: onlinePayment.otpExpiry
      }
    });

  } catch (error) {
    console.error("Error resending OTP:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Delete online payment
export const deleteOnlinePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const onlinePayment = await OnlinePayment.findByIdAndDelete(id);

    if (!onlinePayment) {
      return res.status(404).json({
        success: false,
        message: "Online payment not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Online payment deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting online payment:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};