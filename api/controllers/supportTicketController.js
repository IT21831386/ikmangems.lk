import Ticket from "../models/ticketModel.js";

/**
 * GET /api/support/tickets
 * Get all tickets (optionally filtered by status)
 */
export async function getAllSupportTickets(req, res) {
  try {
    const { status } = req.query; // ?status=open

    let query = {};
    if (status) {
      query.status = status;
    }

    const tickets = await Ticket.find(query)
      .sort({ updatedAt: -1 })
      .select("-__v");

    res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error("❌ Error fetching support tickets:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}

/**
 * GET /api/support/tickets/:id
 * Get single ticket details with full thread
 */
export async function getSupportTicketById(req, res) {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    res.status(200).json({
      success: true,
      ticket,
    });
  } catch (error) {
    console.error("❌ Error fetching ticket:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}

/**
 * PATCH /api/support/tickets/:id/status
 * Update ticket status (open, in_progress, resolved, etc.)
 */
export async function updateSupportTicketStatus(req, res) {
  try {
    const { status } = req.body;

    if (
      !status ||
      !["open", "in_progress", "resolved", "closed", "pending"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing status",
      });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    ticket.status = status;
    await ticket.save();

    res.status(200).json({
      success: true,
      message: "Ticket status updated",
      ticket,
    });
  } catch (error) {
    console.error("❌ Error updating status:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}

/**
 * POST /api/support/tickets/:id/response
 * Add a response to the ticket (from support agent)
 */
export async function addSupportResponse(req, res) {
  try {
    const { message, attachment } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Response message is required",
      });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    // Enforce SINGLE response per ticket: update existing or create first one
    const trimmed = message.trim();
    if (Array.isArray(ticket.responses) && ticket.responses.length > 0) {
      const existing = ticket.responses[0];
      existing.sender = "admin";
      existing.message = trimmed;
      existing.attachment = attachment || undefined;
      existing.editedAt = new Date();
    } else {
      ticket.responses = [
        {
          sender: "admin",
          message: trimmed,
          attachment: attachment || undefined,
          editedAt: new Date(),
        },
      ];
    }

    await ticket.save();

    res.status(201).json({
      success: true,
      message: "Response saved",
      response: ticket.responses[0] || null,
      ticket,
    });
  } catch (error) {
    console.error("❌ Error adding response:", error.message);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}

/**
 * PUT /api/support/tickets/:id/response
 * Edit the single response (must exist; otherwise creates one)
 */
export async function editSupportResponse(req, res) {
  try {
    const { message, attachment } = req.body;
    if (!message?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Response message is required" });
    }
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket)
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });

    const trimmed = message.trim();
    if (Array.isArray(ticket.responses) && ticket.responses.length > 0) {
      const existing = ticket.responses[0];
      existing.sender = "admin";
      existing.message = trimmed;
      existing.attachment = attachment || undefined;
      existing.editedAt = new Date();
    } else {
      ticket.responses = [
        {
          sender: "admin",
          message: trimmed,
          attachment: attachment || undefined,
          editedAt: new Date(),
        },
      ];
    }

    await ticket.save();
    return res
      .status(200)
      .json({
        success: true,
        message: "Response updated",
        response: ticket.responses[0],
        ticket,
      });
  } catch (error) {
    console.error("❌ Error editing response:", error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
}

/**
 * DELETE /api/support/tickets/:id/response
 * Remove the single response
 */
export async function deleteSupportResponse(req, res) {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket)
      return res
        .status(404)
        .json({ success: false, message: "Ticket not found" });

    ticket.responses = [];
    // Ensure Mongoose detects array mutation
    try {
      ticket.markModified("responses");
    } catch {}
    await ticket.save();
    return res
      .status(200)
      .json({ success: true, message: "Response deleted", ticket });
  } catch (error) {
    console.error("❌ Error deleting response:", error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
}
