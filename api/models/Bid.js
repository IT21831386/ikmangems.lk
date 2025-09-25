import mongoose from "mongoose";

const bidSchema = new mongoose.Schema(
  {
    gem: { type: mongoose.Schema.Types.ObjectId, ref: "Gem", required: true },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "refused"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Bid", bidSchema);
