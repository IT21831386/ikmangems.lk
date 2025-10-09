import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema(
  {
    gemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gemstone",
      required: [true, "Gemstone reference is required"],
    },

    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Seller reference is required"],
    },

    // Auction details
    startPrice: {
      type: Number,
      required: [true, "Starting price is required"],
      min: [1, "Starting price must be at least 1 LKR"],
    },

    currentHighestBid: {
      type: Number,
      default: 0,
    },

    highestBidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    startTime: {
      type: Date,
      required: [true, "Auction start time is required"],
      validate: {
        validator: function (value) {
          return value > new Date();
        },
        message: "Start time must be in the future",
      },
    },

    endTime: {
      type: Date,
      required: [true, "Auction end time is required"],
      validate: {
        validator: function (value) {
          return value > this.startTime;
        },
        message: "End time must be after start time",
      },
    },

    status: {
      type: String,
      enum: ["pending", "active", "completed", "cancelled"],
      default: "pending",
    },

    // Auction metadata
    totalBids: {
      type: Number,
      default: 0,
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Automatically update status based on time
auctionSchema.pre("save", function (next) {
  const now = new Date();
  if (this.status !== "completed" && this.status !== "cancelled") {
    if (now >= this.startTime && now < this.endTime) {
      this.status = "active";
    } else if (now >= this.endTime) {
      this.status = "completed";
    } else {
      this.status = "pending";
    }
  }
  next();
});

const Auction = mongoose.model("Auction", auctionSchema);

export default Auction;
