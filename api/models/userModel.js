// models/userModel.js
/*import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String }, // optional
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "seller", "admin"], // match frontend roles
      default: "user",
    },
    phone: { type: String },
    country: { type: String },
    city: { type: String },
    address: { type: String },

    status: {
      type: String,
      enum: ["active", "deleted", "suspended"],
      default: "active",
    },

    isAccountVerified: { type: Boolean, default: false },
    verifyOtp: String,
    verifyOtpExpireAt: Number,
    resetOtp: String,
    resetOtpExpireAt: Number,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
*/

// models/userModel.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "seller", "admin"],
      default: "user",
    },
    phone: { type: String },
    country: { type: String },
    city: { type: String },
    address: { type: String },
    bio: { type: String },
    status: {
      type: String,
      enum: ["active", "deleted", "suspended"],
      default: "active",
    },
    isAccountVerified: { type: Boolean, default: false },
    verifyOtp: String,
    verifyOtpExpireAt: Number,
    resetOtp: String,
    resetOtpExpireAt: Number,


    nicFrontImage: { type: String },
    nicBackImage: { type: String },
    nicStatus: {
      type: String,
      enum: ["not_uploaded", "pending", "approved", "rejected"],
      default: "not_uploaded",
    },

    // Step 4 - Business Documents (Optional)
    businessDocs: [{ type: String }], // array to store multiple docs if needed
    businessStatus: {
      type: String,
      enum: ["not_uploaded", "pending", "approved", "rejected", "skipped"],
      default: "not_uploaded",
    },

    // Step 5 - Registration Payment
    registrationPaymentStatus: {
      type: String,
      enum: ["unpaid", "pending", "paid"],
      default: "unpaid",
    },

     payoutStatus: {
      type: String,
      enum: ["not_completed", "completed"],
      default: "not_completed",
    },

    // Step 6 - Platform Review (Final Admin Approval)
    sellerVerificationStatus: {
      type: String,
      enum: ["not_started", "in_review", "verified", "rejected"],
      default: "not_started",
    },
    
    // Additional fields for verification
    verificationNotes: { type: String },
    nicRejectionReason: { type: String },
    businessRejectionReason: { type: String },
    
    
    // Saved credit cards
    savedCards: [{
      cardNumber: { type: String, required: true },
      cardType: { type: String, required: true },
      expiryDate: { type: String, required: true },
      holderName: { type: String, required: true },
      isDefault: { type: Boolean, default: false },
      addedAt: { type: Date, default: Date.now }
    }],
  },
  { timestamps: true }
);

const userModel = mongoose.model("User", userSchema);
export default userModel;