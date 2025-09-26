import Bid from "../models/Bid.js";
import Gemstone from "../models/Gem.js";
import User from "../models/userModel.js";
// Place bid
export const placeBid = async (req, res) => {
  try {
    const { gemId, amount } = req.body;
    const gem = await Gem.findById(gemId);
    if (!gem) return res.status(404).json({ message: "Gem not found" });

    // Update current bid
    if (amount <= gem.currentBid) {
      return res
        .status(400)
        .json({ message: "Bid must be higher than current bid" });
    }

    gem.currentBid = amount;
    gem.bidCount += 1;
    await gem.save();

    const bid = new Bid({
      gem: gemId,
      buyer: req.user.id,
      amount,
    });
    await bid.save();

    res.status(201).json(bid);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get bids for a gem
export const getBidsByGem = async (req, res) => {
  try {
    const bids = await Bid.find({ gem: req.params.gemId });
    console.log(bids);
    res.status(200).json(bids);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get bids by user
export const getBidsByUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const bids = await Bid.find({ buyer: userId })
      .populate("gem", "name currentBid")
      .select("amount createdAt status")
      .sort({ createdAt: -1 });

    res.status(200).json(bids);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all bids
export const getAllBids = async (req, res) => {
  try {
    const bids = await Bid.find();

    // Map bids to include gem and buyer details manually
    const detailedBids = await Promise.all(
      bids.map(async (bid) => {
        const gem = await Gemstone.findById(bid.gem).select(
          "name category images"
        );
        const buyer = bid.buyer
          ? await User.findById(bid.buyer).select("name email")
          : null;

        return {
          _id: bid._id,
          gem: gem
            ? {
                _id: gem._id,
                name: gem.name,
                category: gem.category,
                images: gem.images,
              }
            : null,
          buyer: buyer
            ? {
                _id: buyer._id,
                name: buyer.name,
                email: buyer.email,
              }
            : null,
          amount: bid.amount,
          status: bid.status,
          createdAt: bid.createdAt,
          updatedAt: bid.updatedAt,
        };
      })
    );

    res.status(200).json({
      success: true,
      totalBids: detailedBids.length,
      bids: detailedBids,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
