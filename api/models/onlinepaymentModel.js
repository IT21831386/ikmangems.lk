import mongoose from "mongoose";

const onlinePaymentSchema = new mongoose.Schema({
    // Basic payment info
    auctionId: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    remark: {
        type: String,
    },
    
    // Bidder details (from home page)
    fullName: {
        type: String,
        required: true,
    },
    emailAddress: {
        type: String,
        required: true,
    },
    contactNumber: {
        type: String,
        required: true,
    },
    billingAddress: {
        type: String,
        required: true,
    },
    
    // Card details
    cardType: {
        type: String,
        required: true,
        enum: ['visa', 'mastercard'],
        default: 'visa'
    },
    cardNumber: {
        type: String,
        required: true,
    },
    expiryMonth: {
        type: String,
        required: true,
    },
    expiryYear: {
        type: String,
        required: true,
    },
    cardHolderName: {
        type: String,
        required: true,
    },
    cvvNumber: {
        type: String,
        required: true,
    },
    
    // OTP verification
    otp: {
        type: String,
        required: true,
    },
    otpExpiry: {
        type: Date,
        required: true,
    },
    verifiedAt: {
        type: Date,
    },
    
    // Payment status
    status: {
        type: String,
        enum: ['pending', 'verified', 'completed', 'failed', 'cancelled'],
        default: 'pending',
    },
    
    // Transaction details
    transactionId: {
        type: String,
        unique: true,
        sparse: true, // allows null values but ensures uniqueness when present
    },
    
    // Payment completion timestamp
    completedAt: {
        type: Date,
    }
}, 
{ 
    timestamps: true // createdAt, updatedAt
});

// Generate transaction ID before saving
onlinePaymentSchema.pre('save', function(next) {
    if (this.isNew && !this.transactionId) {
        this.transactionId = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9);
    }
    next();
});

// Method to check if OTP is expired
onlinePaymentSchema.methods.isOtpExpired = function() {
    return new Date() > this.otpExpiry;
};

// Method to mask card number (for display purposes)
onlinePaymentSchema.methods.getMaskedCardNumber = function() {
    return this.maskedCardNumber;
};

const OnlinePayment = mongoose.model("OnlinePayment", onlinePaymentSchema);

export default OnlinePayment;

