import OnlinePayment from "../models/onlinepaymentModel.js";
import User from "../models/userModel.js";
import textlkService from "../services/textlkService.js";
import transporter from "../config/nodemailer.js";
import dotenv from "dotenv";
dotenv.config();

// Create a new online payment
export const createOnlinePayment = async (req, res) => {
  try {
    console.log('Received payment request:', req.body);
    
    const {
      bidId,
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
      billingAddress,
      paymentType,
      saveCardDetails
    } = req.body;
    
    console.log('Extracted paymentType:', paymentType);

    // Validate required fields (bidId is not required for any payment type)
    if (!amount || !cardNumber || !cardHolderName || !contactNumber) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields including contact number"
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Send OTP via TextLK
    console.log('Sending OTP to:', contactNumber);
    const smsResult = await textlkService.sendOTP(
      contactNumber,
      `Your OTP for ikmangems.lk payment verification is: ${otp}. Valid for 7 minutes.`
    );
    console.log('SMS Result:', smsResult);
    
    if (!smsResult.success) {
      console.error('SMS failed:', smsResult.error);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP",
        error: smsResult.error
      });
    }

    // Create new online payment record (without sensitive card details)
    const onlinePayment = new OnlinePayment({
      bidId: paymentType === 'registration' ? 'REGISTRATION' : bidId, // Use placeholder for registration
      amount: parseFloat(amount),
      remark,
      cardType, // Only store card type (visa/mastercard)
      // Note: cardNumber, expiryMonth, expiryYear, cardHolderName, cvvNumber
      // are NOT stored in database for security reasons
      fullName,
      emailAddress,
      contactNumber,
      billingAddress,
      status: 'pending',
      otp: otp,
      otpExpiry: new Date(Date.now() + 7 * 60 * 1000), // 7 minutes from now
      paymentType: paymentType || 'order' // Store payment type
    });
    
    console.log('Saving payment to database with paymentType:', paymentType);

    await onlinePayment.save();
    console.log("Online payment saved successfully:", onlinePayment._id);

    // Save card details if requested
    if (saveCardDetails) {
      try {
        // User model is already imported at the top
        
        // Find user by email
        console.log('Looking for user with email:', emailAddress);
        const user = await User.findOne({ email: emailAddress });
        console.log('User found:', user ? 'Yes' : 'No');
        if (user) {
          // Create masked card number for storage
          const maskedCardNumber = `**** **** **** ${cardNumber.slice(-4)}`;
          
          // Create card object
          const cardData = {
            cardNumber: maskedCardNumber,
            cardType: cardType.charAt(0).toUpperCase() + cardType.slice(1),
            expiryDate: `${expiryMonth}/${expiryYear}`,
            holderName: cardHolderName,
            isDefault: false,
            addedAt: new Date()
          };

          // Add card to user's saved cards
          if (!user.savedCards) {
            user.savedCards = [];
          }
          
          // Check if card already exists
          const existingCard = user.savedCards.find(card => 
            card.cardNumber === maskedCardNumber && 
            card.expiryDate === cardData.expiryDate
          );
          
          if (!existingCard) {
            user.savedCards.push(cardData);
            await user.save();
            console.log("Card details saved for user:", emailAddress);
            console.log("User's saved cards after saving:", user.savedCards);
          } else {
            console.log("Card already exists for user:", emailAddress);
          }
        } else {
          console.log("User not found for email:", emailAddress);
        }
      } catch (cardError) {
        console.error("Error saving card details:", cardError);
        // Don't fail the payment if card saving fails
      }
    }

    res.status(201).json({
      success: true,
      message: "Payment initiated successfully",
      data: {
        id: onlinePayment._id,
        status: onlinePayment.status,
        // Don't send OTP in response for security
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
    console.log('=== GET ALL ONLINE PAYMENTS ===');
    const onlinePayments = await OnlinePayment.find().sort({ createdAt: -1 });
    console.log('Found payments:', onlinePayments.length);
    console.log('Payments with paymentType:', onlinePayments.map(p => ({ 
      id: p._id, 
      paymentType: p.paymentType, 
      status: p.status, 
      createdAt: p.createdAt 
    })));
    
    // Remove sensitive fields from response
    const safePayments = onlinePayments.map(payment => {
      const paymentObj = payment.toObject();
      // Remove sensitive card details
      delete paymentObj.cardNumber;
      delete paymentObj.expiryMonth;
      delete paymentObj.expiryYear;
      delete paymentObj.cardHolderName;
      delete paymentObj.cvvNumber;
      return paymentObj;
    });
    
    res.status(200).json({
      success: true,
      count: safePayments.length,
      data: safePayments
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

    // Remove sensitive fields from response
    const paymentObj = onlinePayment.toObject();
    delete paymentObj.cardNumber;
    delete paymentObj.expiryMonth;
    delete paymentObj.expiryYear;
    delete paymentObj.cardHolderName;
    delete paymentObj.cvvNumber;

    res.status(200).json({
      success: true,
      data: paymentObj
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

// Complete payment with real transaction ID
export const completePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { gatewayTransactionId } = req.body;

    if (!gatewayTransactionId) {
      return res.status(400).json({
        success: false,
        message: "Gateway transaction ID is required"
      });
    }

    const onlinePayment = await OnlinePayment.findById(id);

    if (!onlinePayment) {
      return res.status(404).json({
        success: false,
        message: "Online payment not found"
      });
    }

    // Update payment with real transaction ID and complete status
    onlinePayment.transactionId = gatewayTransactionId; // Save the real transaction ID
    onlinePayment.status = 'completed';
    onlinePayment.completedAt = new Date();
    await onlinePayment.save();

    // Update user's registration payment status if this is a registration payment
    if (onlinePayment.paymentType === 'registration') {
      try {
        const user = await User.findOne({ email: onlinePayment.emailAddress });
        if (user) {
          user.registrationPaymentStatus = 'paid';
          await user.save();
          console.log(`Updated user ${user.email} registration payment status to paid`);
        } else {
          console.warn(`User not found for email: ${onlinePayment.emailAddress}`);
        }
      } catch (userUpdateError) {
        console.error('Error updating user registration payment status:', userUpdateError);
        // Don't fail the payment completion if user update fails
      }
    }

    // Send confirmation email
    try {
      const paymentId = `ONL_${onlinePayment._id.slice(-8).toUpperCase()}`;
      const amount = new Intl.NumberFormat('en-LK', {
        style: 'currency',
        currency: 'LKR',
        minimumFractionDigits: 0
      }).format(onlinePayment.amount);

      const emailSubject = `Payment Confirmation - ${paymentId}`;
      const emailText = `
Payment Confirmation - ${paymentId}

Dear ${onlinePayment.fullName},

Thank you for your payment! We are pleased to confirm that your payment has been processed successfully.

Payment Details:
- Payment Number: ${paymentId}
- Transaction ID: ${onlinePayment.transactionId}
- Auction ID: ${onlinePayment.bidId}
- Payment Method: Online Payment
- Card Type: ${onlinePayment.cardType === 'visa' ? 'Visa Card' : onlinePayment.cardType === 'mastercard' ? 'Master Card' : 'Card Payment'}
- Amount: ${amount}
- Payment Date: ${new Date().toLocaleDateString('en-LK')}
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
        to: onlinePayment.emailAddress,
        subject: emailSubject,
        text: emailText,
      });

      console.log('Payment confirmation email sent successfully to:', onlinePayment.emailAddress);
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Don't fail the payment completion if email fails
    }

    res.status(200).json({
      success: true,
      message: "Payment completed successfully",
      data: {
        id: onlinePayment._id,
        transactionId: onlinePayment.transactionId,
        status: onlinePayment.status,
        completedAt: onlinePayment.completedAt
      }
    });
  } catch (error) {
    console.error("Error completing payment:", error);
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

    // Update user's registration payment status if this is a registration payment and status is completed
    if (onlinePayment.paymentType === 'registration' && status === 'completed') {
      try {
        const user = await User.findOne({ email: onlinePayment.emailAddress });
        if (user) {
          user.registrationPaymentStatus = 'paid';
          await user.save();
          console.log(`Updated user ${user.email} registration payment status to paid via status update`);
        } else {
          console.warn(`User not found for email: ${onlinePayment.emailAddress}`);
        }
      } catch (userUpdateError) {
        console.error('Error updating user registration payment status:', userUpdateError);
        // Don't fail the status update if user update fails
      }
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

    // Debug logging
    console.log('=== OTP VERIFICATION DEBUG ===');
    console.log('Payment ID:', paymentId);
    //console.log('Expected OTP (from DB):', onlinePayment.otp);
    //console.log('Provided OTP (from user):', otp);
    //console.log('OTP Match:', onlinePayment.otp === otp);
    //console.log('OTP Expiry:', onlinePayment.otpExpiry);
    console.log('Current Time:', new Date());
    //console.log('OTP Expired:', new Date() > onlinePayment.otpExpiry);

    // Verify OTP
    if (onlinePayment.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
        debug: {
          expected: onlinePayment.otp,
          provided: otp
        }
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
    
    // Send OTP via TextLK
    const smsResult = await textlkService.sendOTP(
      onlinePayment.contactNumber,
      `Your OTP for ikmangems.lk payment verification is: ${newOtp}. Valid for 7 minutes.`
    );
    
    if (!smsResult.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to resend OTP",
        error: smsResult.error
      });
    }

    // Update payment record
    onlinePayment.otp = newOtp;
    onlinePayment.otpExpiry = new Date(Date.now() + 7 * 60 * 1000); // 7 minutes from now
    await onlinePayment.save();

    res.status(200).json({
      success: true,
      message: "OTP resent successfully",
      data: {
        id: onlinePayment._id,
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

// Simple server test
export const testServer = async (req, res) => {
  try {
    // Test database connection
    const paymentCount = await OnlinePayment.countDocuments();
    
    res.status(200).json({
      success: true,
      message: "Server is working!",
      timestamp: new Date().toISOString(),
      database: "Connected",
      totalPayments: paymentCount
    });
  } catch (error) {
    console.error("Error testing server:", error);
    res.status(500).json({
      success: false,
      message: "Error testing server",
      error: error.message
    });
  }
};

// Test TextLK connection
/*export const testTextLK = async (req, res) => {
  try {
    const apiKey = process.env.TEXTLK_API_KEY || '1652|LpFvluflFii5JufVSbQ6qO6G5ffTnCyxkDyrnFqF68828cb0';
    
    console.log('=== TESTING TEXTLK API ===');
    console.log('API Key:', apiKey ? apiKey.substring(0, 10) + '...' : 'NOT SET');
    
    // Test different TextLK endpoints
    const testEndpoints = [
      'https://app.text.lk/api/v3/profile',
      'https://app.text.lk/api/v3/account',
      'https://app.text.lk/api/v3/balance',
      'https://app.text.lk/api/http/profile',
      'https://app.text.lk/api/http/account'
    ];
    
    let workingEndpoint = null;
    let responseData = null;
    
    for (const endpoint of testEndpoints) {
      try {
        console.log(`Testing endpoint: ${endpoint}`);
        const response = await axios.get(endpoint, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        console.log(` ${endpoint} worked! Status: ${response.status}`);
        console.log('Response:', response.data);
        
        workingEndpoint = endpoint;
        responseData = response.data;
        break;
      } catch (error) {
        console.log(` ${endpoint} failed:`, error.response?.status, error.response?.data?.message || error.message);
      }
    }
    
    if (workingEndpoint) {
      res.status(200).json({
        success: true,
        message: "TextLK API is working!",
        workingEndpoint: workingEndpoint,
        data: responseData,
        accountInfo: responseData
      });
    } else {
      res.status(200).json({
        success: false,
        message: "All TextLK endpoints failed",
        error: "Check your API key and account status",
        suggestion: "This might be because you're using a free account with limited features"
      });
    }
  } catch (error) {
    console.error("Error testing TextLK:", error);
    res.status(500).json({
      success: false,
      message: "Error testing TextLK connection",
      error: error.message
    });
  }
};

// Simple SMS test with phone number in URL
export const testSMSSimple = async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required in URL. Use: /test-sms/0771234567"
      });
    }

    console.log('=== SMS TEST STARTED ===');
    console.log('Phone number:', phoneNumber);
    console.log('TextLK API Key:', process.env.TEXTLK_API_KEY ? 'SET' : 'NOT SET');
    
    // Try TextLK API directly first
    const apiKey = process.env.TEXTLK_API_KEY || '1652|LpFvluflFii5JufVSbQ6qO6G5ffTnCyxkDyrnFqF68828cb0';
    
    // Format phone number
    let formattedNumber = phoneNumber;
    if (phoneNumber.startsWith('0')) {
      formattedNumber = '94' + phoneNumber.substring(1);
    }
    
    console.log('Formatted phone number:', formattedNumber);
    
    // Try TextLK SMS API directly - based on TextLK documentation
    const smsPayload = {
      to: formattedNumber,
      message: 'Test OTP: 123456',
      from: 'ikmangems'
    };
    
    // Also try alternative payload formats that might work
    const alternativePayloads = [
      {
        recipient: formattedNumber,
        message: 'Test OTP: 123456',
        from: 'ikmangems',
        api_token: apiKey
      },
      {
        recipient: formattedNumber,
        message: 'Test OTP: 123456',
        from: 'ikmangems',
        api_token: apiKey.replace('|', ' | ')
      },
      {
        recipient: formattedNumber,
        message: 'Test OTP: 123456',
        from: 'ikmangems',
        api_token: apiKey,
        api_key: apiKey
      },
      {
        to: formattedNumber,
        message: 'Test OTP: 123456',
        from: 'ikmangems',
        api_token: apiKey
      },
      {
        phone: formattedNumber,
        message: 'Test OTP: 123456',
        sender: 'ikmangems',
        api_token: apiKey
      },
      {
        recipient: formattedNumber,
        text: 'Test OTP: 123456',
        from: 'ikmangems',
        api_token: apiKey
      },
      {
        recipient: formattedNumber,
        message: 'Test OTP: 123456',
        from: 'ikmangems',
        token: apiKey
      },
      {
        recipient: formattedNumber,
        message: 'Test OTP: 123456',
        from: 'ikmangems',
        access_token: apiKey
      },
      {
        recipient: formattedNumber,
        message: 'Test OTP: 123456',
        from: 'ikmangems',
        api_key: apiKey
      },
      {
        recipient: formattedNumber,
        message: 'Test OTP: 123456',
        from: 'ikmangems',
        key: apiKey
      }
    ];
    
    console.log('SMS Payload:', smsPayload);
    
    // Try multiple TextLK endpoints and payload formats
    const endpoints = [
      'https://app.text.lk/api/http/sms/send',
      'https://app.text.lk/api/v3/sms/send',
      'https://app.text.lk/api/sms/send'
    ];
    
    let success = false;
    let response = null;
    let workingEndpoint = null;
    let workingPayload = null;
    
    for (const endpoint of endpoints) {
      for (const payload of alternativePayloads) {
        try {
          console.log(`\n=== Trying ${endpoint} ===`);
          console.log('Payload:', payload);
          
          response = await axios.post(endpoint, payload, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          
          console.log('Response Status:', response.status);
          console.log('Response Data:', response.data);
          
          // Check if response indicates success
          if (response.data.status === 'success' || response.data.success === true || response.status === 200) {
            console.log('✅ SMS sent successfully!');
            success = true;
            workingEndpoint = endpoint;
            workingPayload = payload;
            break;
          } else {
            console.log(' Response indicates failure:', response.data);
          }
        } catch (error) {
          console.log(` ${endpoint} failed:`, error.response?.status, error.response?.data?.message || error.message);
        }
      }
      if (success) break;
    }
    
    if (success) {
      res.status(200).json({
        success: true,
        message: "TextLK SMS sent successfully - check your phone!",
        phoneNumber: phoneNumber,
        workingEndpoint: workingEndpoint,
        workingPayload: workingPayload,
        data: response.data
      });
    } else {
      console.log('\n=== All TextLK attempts failed, trying service fallback ===');
      
      // Fallback to service
      const result = await textlkService.sendOTP(phoneNumber, 'Test OTP: 123456');
      
      res.status(200).json({
        success: result.success,
        message: result.success ? "SMS sent via service - check your phone!" : "All SMS methods failed - check console logs",
        phoneNumber: phoneNumber,
        data: result
      });
    }
  } catch (error) {
    console.error("Error testing SMS:", error);
    res.status(500).json({
      success: false,
      message: "Error testing SMS",
      error: error.message
    });
  }
};

// Test SMS sending with a specific phone number
export const testSMS = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required"
      });
    }

    console.log('=== TESTING SMS SENDING ===');
    console.log('Phone number:', phoneNumber);
    console.log('Environment variables:');
    console.log('TEXTLK_API_KEY:', process.env.TEXTLK_API_KEY ? process.env.TEXTLK_API_KEY.substring(0, 10) + '...' : 'NOT SET');
    console.log('TEXTLK_API_URL:', process.env.TEXTLK_API_URL || 'NOT SET');
    console.log('TEXTLK_SENDER_ID:', process.env.TEXTLK_SENDER_ID || 'NOT SET');
    
    const result = await textlkService.sendOTP(phoneNumber, 'Test OTP: 123456');
    
    res.status(200).json({
      success: result.success,
      message: result.success ? "SMS test completed" : "SMS test failed",
      data: result
    });
  } catch (error) {
    console.error("Error testing SMS:", error);
    res.status(500).json({
      success: false,
      message: "Error testing SMS",
      error: error.message
    });
  }
};
*/
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

// Test email service
export const testEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required"
      });
    }

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'Test Email from ikmangems.lk',
      text: 'This is a test email from ikmangems.lk payment system. If you receive this email, the email service is working correctly!',
    });

    res.status(200).json({
      success: true,
      message: "Test email sent successfully",
      data: {
        success: true,
        message: "Test email sent successfully"
      }
    });
  } catch (error) {
    console.error("Error testing email:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Soft delete online payment (for user deletion)
export const softDeleteOnlinePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { deleted, deleteReason, deletedBy, deletedAt } = req.body;

    const payment = await OnlinePayment.findById(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    console.log('Updating online payment with soft delete:', { id, deleted, deleteReason, deletedBy, deletedAt });
    
    const updatedPayment = await OnlinePayment.findByIdAndUpdate(
      id,
      {
        deleted: deleted || true,
        deleteReason: deleteReason || 'Deleted by user',
        deletedBy: deletedBy || 'user',
        deletedAt: deletedAt || new Date().toISOString()
      },
      { new: true, runValidators: false }
    );

    console.log('Updated online payment:', { 
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
    console.error("Error in softDeleteOnlinePayment controller", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};