import Feedback from '../models/feedbackModel.js';

// Get all feedback entries
export async function getAllFeedback(req, res) {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json({
      feedbacks
    });
  } catch (error) {
    console.error("❌ Error fetching feedbacks:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}

// Get feedback by ID
export async function getFeedbackById(req, res) {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: "❌ Feedback not found" });
    }
    res.status(200).json(feedback);
  } catch (error) {
    console.error("❌ Error fetching feedback:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}

// Create new feedback
export async function createFeedback(req, res) {
  try {
    const { name, email, message, rating } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "❌ Missing required fields" });
    }

    const newFeedback = new Feedback({ name, email, message, rating });
    await newFeedback.save();

    res.status(201).json({
      message: "✅ Feedback submitted successfully",
      feedback: newFeedback
    });
  } catch (error) {
    console.error("❌ Error creating feedback:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}

// Update feedback
export async function updateFeedback(req, res) {
  try {
    const { name, email, message, rating } = req.body;

    const updatedFeedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { name, email, message, rating },
      { new: true, runValidators: true }
    );

    if (!updatedFeedback) {
      return res.status(404).json({ message: "❌ Feedback not found" });
    }

    res.status(200).json({
      message: "✅ Feedback updated successfully",
      feedback: updatedFeedback
    });

  } catch (error) {
    console.error("❌ Error updating feedback:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}

// Delete feedback
export async function deleteFeedback(req, res) {
  try {
    const deleted = await Feedback.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "❌ Feedback not found" });

    res.status(200).json({ message: "✅ Feedback deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting feedback:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}