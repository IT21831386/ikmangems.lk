import mongoose from "mongoose";

const payoutSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    payoutMethod: {
      type: String,
      enum: ["bank_account", "mobile_money"],
      required: true,
    },
    
    // Bank Account Details
    bankName: { type: String },
    accountNumber: { type: String },
    accountHolderName: { type: String },
    branchCode: { type: String },
    swiftCode: { type: String },
    
    // Mobile Money Details
    mobileProvider: { type: String },
    mobileNumber: { type: String },
    accountName: { type: String },
  },
  { timestamps: true }
);

const payoutModel = mongoose.model("Payout", payoutSchema);
export default payoutModel;