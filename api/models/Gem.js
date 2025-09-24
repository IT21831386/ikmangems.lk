import mongoose from "mongoose";

const gemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String },
    startingBid: { type: Number, required: true },
    currentBid: { type: Number, default: 0 },
    bidCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    location: { type: String },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sellerRating: { type: Number },
    certification: { type: String },
    weight: { type: String },
    features: [{ type: String }],
    status: {
      type: String,
      enum: ["pending", "active", "closed"],
      default: "pending",
    },
    image: { type: String },
    auctionEndTime: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Gem", gemSchema);
