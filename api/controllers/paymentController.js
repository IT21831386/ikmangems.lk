   import Payment from "../models/paymentModel.js"
   import emailService from "../services/emailService.js"

export async function getAllPayments(_, res) {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 }); // -1 will sort in desc. order (newest first)
    res.status(200).send(payments);
  } catch (error) {
    console.error("Error in getAllPayments controller", error);
  res.status(500).json({ message: "Internal server error" });
  }
}

export async function getPaymentById(req, res) {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found!" });
    res.json(payment);
  } catch (error) {
    console.error("Error in getPaymentById controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function createPayment(req, res) {
  try {
    console.log("=== CREATE PAYMENT REQUEST ===");
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    console.log("Request headers:", req.headers);
    
   const { amount, paiddate, bank, branch, remark, fullName, emailAddress, contactNumber, billingAddress, auctionId } = req.body;
   
   console.log("Extracted fields:", {
     amount, paiddate, bank, branch, remark, fullName, emailAddress, contactNumber, billingAddress, auctionId
   });
   
   // Handle file upload - if slip is uploaded, use the file path
   let slipPath = '';
   if (req.file) {
     slipPath = `/uploads/${req.file.filename}`;
     console.log("File uploaded, slip path:", slipPath);
   } else if (req.body.slip) {
     // If slip is provided as URL/path in body
     slipPath = req.body.slip;
     console.log("Slip from body:", slipPath);
   } else {
     console.log("No slip provided");
     return res.status(400).json({ message: "Slip image is required" });
   }
   
   const paymentData = { 
     amount, 
     paiddate, 
     bank, 
     branch, 
     slip: slipPath, 
     remark,
     fullName,
     emailAddress,
     contactNumber,
     billingAddress,
     auctionId
   };
   
   console.log("Payment data to save:", paymentData);
   
   const payments = new Payment(paymentData);

    const savedPayment = await payments.save();
    console.log("Payment saved successfully:", savedPayment);
    res.status(201).json({
      success: true,
      message: "Bank deposit submitted successfully",
      data: savedPayment
    });
  } catch (error) {
    console.error("Error in createPayment controller", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      success: false,
      message: "Failed to submit bank deposit. Please try again.", 
      error: error.message 
    });
  }
}

export async function updatePayment(req, res) {
  try {
     const { amount, paiddate, bank, branch, slip, remark, fullName, emailAddress, contactNumber, billingAddress, auctionId } = req.body;
     const payment = await Payment.findByIdAndUpdate(req.params.id, {
       amount, paiddate, bank, branch, slip, remark, fullName, emailAddress, contactNumber, billingAddress, auctionId
     }, { new: true });
     if (!payment) return res.status(404).json({ message: "Payment not found!" });
     res.json(payment);
  } catch (error) {
    console.error("Error in updatePayment controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deletePayment(req, res) {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ message: "Payment not found!" });
    res.json({ message: "Payment deleted successfully" });
  } catch (error) {
    console.error("Error in deletePayment controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getPaymentHistory(req, res) {
  try {
    const { auctionId } = req.params;
    const payments = await Payment.find({ auctionId }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    console.error("Error in getPaymentHistory controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Update payment status (for admin approval)
export async function updatePaymentStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['success', 'failure'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'success' or 'failure'"
      });
    }

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    // Update payment status
    payment.status = status;
    await payment.save();

    // Send confirmation email if status is success
    if (status === 'success') {
      try {
        const emailData = {
          fullName: payment.fullName,
          emailAddress: payment.emailAddress,
          paymentId: `BNK_${payment._id.slice(-8).toUpperCase()}`,
          transactionId: null, // Bank deposits don't have transaction ID
          auctionId: payment.auctionId,
          amount: payment.amount,
          paymentType: 'Bank Deposit',
          cardType: null,
          bank: payment.bank,
          branch: payment.branch,
          date: payment.paiddate ? new Date(payment.paiddate).toLocaleDateString('en-LK') : new Date().toLocaleDateString('en-LK')
        };

        const emailResult = await emailService.sendPaymentConfirmation(emailData);
        
        if (emailResult.success) {
          console.log('Bank deposit confirmation email sent successfully:', emailResult.messageId);
        } else {
          console.error('Failed to send bank deposit confirmation email:', emailResult.error);
        }
      } catch (emailError) {
        console.error('Error sending bank deposit confirmation email:', emailError);
        // Don't fail the status update if email fails
      }
    }

    res.status(200).json({
      success: true,
      message: `Payment status updated to ${status}`,
      data: {
        id: payment._id,
        status: payment.status,
        updatedAt: payment.updatedAt
      }
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}