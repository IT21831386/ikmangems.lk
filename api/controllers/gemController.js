import Gem from "../models/Gem.js";

// Create Gem (by seller)
export const createGem = async (req, res) => {
  try {
    const newGem = new Gem({ ...req.body, seller: req.user.id });
    await newGem.save();
    res.status(201).json(newGem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all gems (for homepage)
export const getGems = async (req, res) => {
  try {
    const gems = await Gem.find({ status: "active" }).populate(
      "seller",
      "name"
    );
    res.status(200).json(gems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get gem by ID
export const getGemById = async (req, res) => {
  try {
    const gem = await Gem.findById(req.params.id).populate(
      "seller",
      "name email"
    );
    if (!gem) return res.status(404).json({ message: "Gem not found" });
    res.status(200).json(gem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Approve gem (admin)
export const approveGem = async (req, res) => {
  try {
    const gem = await Gem.findById(req.params.id);
    if (!gem) return res.status(404).json({ message: "Gem not found" });
    gem.status = "active";
    await gem.save();
    res.status(200).json(gem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
