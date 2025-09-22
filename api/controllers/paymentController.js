   import Payment from "../models/paymentModel.js"

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
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

export async function updatePayment(req, res) {
  try {
     const { amount, paiddate, bank, branch, slip, remark, fullName, emailAddress, contactNumber, billingAddress, auctionId } = req.body;
     const updatedPayment = await Payment.findByIdAndUpdate(req.params.id,{amount, paiddate, bank, branch, slip, remark, fullName, emailAddress, contactNumber, billingAddress, auctionId },
      {
       new:true,
      }
    );
     if (!updatedPayment) return res.status(404).json({ message: "Payment not found" });
     res.status(200).json({message:"updated"});
  } catch (error) {
    console.error("Error in updatePayment controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deletePayment(req, res) {
  try {
    const deletedPayment = await Payment.findByIdAndDelete(req.params.id);
    if (!deletedPayment) return res.status(404).json({ message: "Payment not found" });
    res.status(200).json({ message: "Payment deleted successfully!" });
  } catch (error) {
    console.error("Error in deletePayment controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Get payment history for a specific user
export async function getPaymentHistory(req, res) {
  try {
    const { userId, email } = req.query;
    
    // Build query based on available parameters
    let query = {};
    if (userId) {
      query._id = userId;
    }
    if (email) {
      query.emailAddress = email;
    }

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .limit(100); // Limit to last 100 payments

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    console.error("Error in getPaymentHistory controller", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: error.message 
    });
  }
}
