import Auction from "../models/Auction.js";
import Gemstone from "../models/Gem.js";

/* ====================== CREATE AUCTION ====================== */
export const createAuction = async (req, res) => {
  try {
    const { gemId, startPrice, startTime, endTime } = req.body;

    const gem = await Gemstone.findById(gemId);
    if (!gem)
      return res
        .status(404)
        .json({ success: false, message: "Gemstone not found" });

    const auction = new Auction({
      gemId,
      sellerId: req.user.id,
      startPrice,
      startTime,
      endTime,
    });
    // Update gem status
    gem.isAuctioned = true;
    await gem.save();
    await auction.save();
    res.status(201).json({ success: true, data: auction });
  } catch (err) {
    console.error("Create auction error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ====================== GET ALL AUCTIONS ====================== */
export const getAllAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find().populate(
      "gemId sellerId",
      "name email"
    );
    res.json({ success: true, data: auctions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ====================== GET AUCTION BY ID ====================== */
export const getAuctionById = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id).populate(
      "gemId sellerId highestBidder winner",
      "name email"
    );
    if (!auction)
      return res
        .status(404)
        .json({ success: false, message: "Auction not found" });
    res.json({ success: true, data: auction });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ====================== PLACE AUCTION BID ====================== */
export const placeAuctionBid = async (req, res) => {
  try {
    const { amount } = req.body;
    const auction = await Auction.findById(req.params.id);
    if (!auction)
      return res
        .status(404)
        .json({ success: false, message: "Auction not found" });

    if (new Date() < auction.startTime || new Date() > auction.endTime)
      return res
        .status(400)
        .json({ success: false, message: "Auction not active" });

    if (amount <= auction.currentHighestBid)
      return res.status(400).json({
        success: false,
        message: "Bid must be higher than current highest bid",
      });

    auction.currentHighestBid = amount;
    auction.highestBidder = req.user.id;
    auction.totalBids += 1;

    await auction.save();
    res.status(200).json({
      success: true,
      message: "Bid placed successfully",
      data: auction,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ====================== COMPLETE AUCTION ====================== */
export const completeAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction)
      return res
        .status(404)
        .json({ success: false, message: "Auction not found" });

    auction.status = "completed";
    auction.winner = auction.highestBidder;
    await auction.save();

    res
      .status(200)
      .json({ success: true, message: "Auction completed", data: auction });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ====================== CANCEL AUCTION ====================== */
export const cancelAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction)
      return res
        .status(404)
        .json({ success: false, message: "Auction not found" });

    if (
      req.user.role !== "admin" &&
      req.user.id !== auction.sellerId.toString()
    )
      return res.status(403).json({
        success: false,
        message: "Only admin or seller can cancel this auction",
      });

    auction.status = "cancelled";
    await auction.save();

    res
      .status(200)
      .json({ success: true, message: "Auction cancelled", data: auction });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSellerNotAuctionedGems = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const gems = await Gem.find({
      seller: sellerId,
      isApproved: true,
      isAuctioned: false,
    }).sort({ createdAt: -1 });

    res.status(200).json(gems);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch not auctioned gems", error });
  }
};
