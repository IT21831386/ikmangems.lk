   import Payment from "../models/paymentModel.js"
   import transporter from "../config/nodemailer.js"
   import dotenv from "dotenv"
   dotenv.config()

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
    
   const { amount, paiddate, bank, branch, remark, fullName, emailAddress, contactNumber, billingAddress, bidId } = req.body;
   
   console.log("Extracted fields:", {
     amount, paiddate, bank, branch, remark, fullName, emailAddress, contactNumber, billingAddress, bidId
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
     auctionId: bidId // Map bidId to auctionId in database
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
     const { amount, paiddate, bank, branch, slip, remark, fullName, emailAddress, contactNumber, billingAddress, bidId } = req.body;
     const payment = await Payment.findByIdAndUpdate(req.params.id, {
       amount, paiddate, bank, branch, slip, remark, fullName, emailAddress, contactNumber, billingAddress, auctionId: bidId
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

// Soft delete payment (for user deletion)
export async function softDeletePayment(req, res) {
  try {
    const { id } = req.params;
    const { deleted, deleteReason, deletedBy, deletedAt } = req.body;

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    // Update payment with soft delete information
    console.log('Updating payment with soft delete:', { id, deleted, deleteReason, deletedBy, deletedAt });
    
    const updatedPayment = await Payment.findByIdAndUpdate(
      id,
      {
        deleted: deleted || true,
        deleteReason: deleteReason || 'Deleted by user',
        deletedBy: deletedBy || 'user',
        deletedAt: deletedAt || new Date().toISOString()
      },
      { new: true, runValidators: false }
    );

    console.log('Updated payment:', { 
      id: updatedPayment._id, 
      deleted: updatedPayment.deleted, 
      deleteReason: updatedPayment.deleteReason,
      deletedBy: updatedPayment.deletedBy 
    });

    res.status(200).json({
      success: true,
      message: "Payment deleted successfully",
      data: {
        id: updatedPayment._id,
        deleted: updatedPayment.deleted,
        deleteReason: updatedPayment.deleteReason,
        deletedBy: updatedPayment.deletedBy,
        deletedAt: updatedPayment.deletedAt
      }
    });
  } catch (error) {
    console.error("Error in softDeletePayment controller", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}

export async function getPaymentHistory(req, res) {
  try {
    const { bidId } = req.params;
    const payments = await Payment.find({ auctionId: bidId }).sort({ createdAt: -1 });
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

    // Update payment status using findByIdAndUpdate to avoid validation issues
    const updatedPayment = await Payment.findByIdAndUpdate(
      id, 
      { status: status }, 
      { new: true, runValidators: false }
    );

    // Send confirmation email if status is success
    if (status === 'success') {
      try {
        const paymentId = `BNK_${payment._id.slice(-8).toUpperCase()}`;
        const amount = new Intl.NumberFormat('en-LK', {
          style: 'currency',
          currency: 'LKR',
          minimumFractionDigits: 0
        }).format(payment.amount);

        const emailSubject = `Payment Confirmation - ${paymentId}`;
        const emailText = `
Payment Confirmation - ${paymentId}

Dear ${payment.fullName},

Thank you for your payment! We are pleased to confirm that your bank deposit has been approved and processed successfully.

Payment Details:
- Payment Number: ${paymentId}
- Auction ID: ${payment.auctionId}
- Payment Method: Bank Deposit
- Bank: ${payment.bank}
- Branch: ${payment.branch}
- Amount: ${amount}
- Payment Date: ${payment.paiddate ? new Date(payment.paiddate).toLocaleDateString('en-LK') : new Date().toLocaleDateString('en-LK')}
- Status: COMPLETED

You can download your payment invoice from your payment history page.

If you have any questions or concerns, please don't hesitate to contact our support team.

Best regards,
ikmangems.lk Team
Colombo, Sri Lanka
Email: support@ikmangems.lk | Tel: +94 11 234 5678
        `;

        await transporter.sendMail({
          from: process.env.SENDER_EMAIL,
          to: payment.emailAddress,
          subject: emailSubject,
          text: emailText,
        });

        console.log('Bank deposit confirmation email sent successfully to:', payment.emailAddress);
      } catch (emailError) {
        console.error('Error sending bank deposit confirmation email:', emailError);
        // Don't fail the status update if email fails
      }
    }

    res.status(200).json({
      success: true,
      message: `Payment status updated to ${status}`,
      data: {
        id: updatedPayment._id,
        status: updatedPayment.status,
        updatedAt: updatedPayment.updatedAt
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