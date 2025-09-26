import mongoose from "mongoose";
import User from "./userModel.js";
import Gemstone from "./Gem.js";

const bidSchema = new mongoose.Schema(
  {
    gem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gemstone",
      required: true,
    },
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
