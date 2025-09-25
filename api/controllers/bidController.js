import Bid from "../models/Bid.js";
import Gem from "../models/Gem.js";

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
    const bids = await Bid.find({ gem: req.params.gemId }).populate(
      "buyer",
      "name email"
    );
    res.status(200).json(bids);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
