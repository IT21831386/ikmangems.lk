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