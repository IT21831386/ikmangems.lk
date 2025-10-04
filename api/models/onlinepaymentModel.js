import mongoose from "mongoose";

const onlinePaymentSchema = new mongoose.Schema({
    // Basic payment info
    bidId: {
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
    
    // Card details (only store non-sensitive info)
    cardType: {
        type: String,
        required: true,
        enum: ['visa', 'mastercard'],
        default: 'visa'
    },
    // Note: cardNumber, expiryMonth, expiryYear, cardHolderName, cvvNumber 
    // should NOT be stored in database for security reasons
    // These should only be used temporarily during payment processing
    
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
    
    // Payment type
    paymentType: {
        type: String,
        enum: ['order', 'penalty', 'registration'],
        default: 'order',
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
    },
    
    // Soft delete fields
    deleted: {
        type: Boolean,
        default: false
    },
    deleteReason: {
        type: String,
        default: null
    },
    deletedBy: {
        type: String,
        default: null
    },
    deletedAt: {
        type: Date,
        default: null
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
