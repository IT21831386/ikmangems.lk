import PDFDocument from 'pdfkit';
import Ticket from '../models/ticketModel.js';





export async function getAllTickets (req, res) {
    try{
        const { email } = req.query;
        const isAdmin = req.headers['x-admin-secret'] && req.headers['x-admin-secret'] === (process.env.ADMIN_SECRET || 'change-me-in-prod');
        if (!email && !isAdmin) {
          // Do not expose all tickets to public users
          return res.status(200).json({ tickets: [] });
        }
        const query = isAdmin ? {} : { email };
        const tickets = await Ticket.find(query).sort({ createdAt: -1 });
        return res.status(200).json({ tickets });
    } catch (error) {
        console.error("Error fetching tickets:", error);
        res.status(500).json({ message: "Server Error" });
    }
}

export async function getTicketById(req, res) {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: "❌ Ticket not found" });
    }

    res.status(200).json(ticket);
  } catch (error) {
    console.error("❌ Error fetching ticket:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}

export async function createTicket(req, res) {
  try {
    // Extract fields from request body
    const { name, email, subject, inquiryType, description, attachment } = req.body;

    // Manually validate required fields (optional but good UX)
    if (!name || !email || !subject || !inquiryType || !description) {
      return res.status(400).json({
        error: "❌ Missing required fields"
      });
    }

    // Create new Ticket document
    const newTicket = new Ticket({
      name,
      email,
      subject,
      inquiryType,
      description,
      attachment // optional
    });

    // Save to MongoDB
    await newTicket.save();

    // Respond with success
    res.status(201).json({ ticket: newTicket });

  } catch (error) {
    console.error("❌ Error creating ticket:", error.message);
    res.status(500).json({
      message: "Server Error",
      error: error.message // helpful for debugging
    });
  }
}

export async function updateTicket  (req, res) {
   try{
    const { name,email,subject,inquiryType,description,attachment } = req.body
    const isAdmin = req.headers['x-admin-secret'] && req.headers['x-admin-secret'] === (process.env.ADMIN_SECRET || 'change-me-in-prod');
    const userEmail = req.headers['x-user-email'];

    const existing = await Ticket.findById(req.params.id);
    if(!existing) return res.status(404).json({ message: "❌ Ticket not found" });

    if (!isAdmin && (!userEmail || existing.email !== userEmail)) {
      return res.status(403).json({ message: 'Forbidden: not your ticket' });
    }

    const update = { name,email,subject,inquiryType,description,attachment };
    Object.keys(update).forEach((k) => update[k] === undefined && delete update[k]);

    const updated = await Ticket.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );

    res.status(200).json({ message: "Ticket updated successfully", ticket: updated });
   } catch (error) {
    console.error("❌ Error update ticket:", error.message);
    res.status(500).json({
      message: "Server Error",
      error: error.message // helpful for debugging
    });
  }  
};

export async function deleteTicket (req, res) {
      try{
        const isAdmin = req.headers['x-admin-secret'] && req.headers['x-admin-secret'] === (process.env.ADMIN_SECRET || 'change-me-in-prod');
        const userEmail = req.headers['x-user-email'];

        const existing = await Ticket.findById(req.params.id);
        if(!existing) return res.status(404).json({ message: "❌ Ticket not found" });

        if (!isAdmin && (!userEmail || existing.email !== userEmail)) {
          return res.status(403).json({ message: 'Forbidden: not your ticket' });
        }

        await existing.deleteOne();
        res.status(200).json({ message: "Ticket deleted successfully" });
      }catch (error) {
    console.error("❌ Error delete ticket:", error.message);
    res.status(500).json({
      message: "Server Error",
      error: error.message // helpful for debugging
    });
  }  
}   

export async function generateTicketPDF(req, res) {
  try {
    const { id } = req.params;
    console.log('PDF generation requested for ticket ID:', id);
    
    const ticket = await Ticket.findById(id);
    console.log('Ticket found:', !!ticket);

    if (!ticket) {
      console.log('Ticket not found for ID:', id);
      return res.status(404).json({ message: 'Ticket not found' });
    }

    console.log('Creating PDF document...');
    const doc = new PDFDocument();

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ticket-${ticket._id}.pdf"`);

    console.log('Setting up PDF stream...');
    // Pipe the PDF into the response
    doc.pipe(res);

    // Add ticket content
    doc.fontSize(20).text(`🎫 Ticket: ${ticket.subject}`, { underline: true });
    doc.moveDown();

    doc.fontSize(12)
      .text(`Name: ${ticket.name}`)
      .text(`Email: ${ticket.email}`)
      .text(`Type: ${ticket.inquiryType}`)
      .text(`Status: ${ticket.status}`)
      .text(`Created At: ${new Date(ticket.createdAt).toLocaleString()}`)
      .text(`Updated At: ${new Date(ticket.updatedAt).toLocaleString()}`)
      .moveDown();

    doc.text(`Description:`, { underline: true, font: 'Helvetica-Bold' });
    doc.font('Helvetica').text(ticket.description || 'No description.').moveDown();

    if (ticket.responses && ticket.responses.length > 0) {
      doc.addPage().fontSize(14).text('💬 Responses:', { underline: true });

      ticket.responses.forEach((r, index) => {
        doc
          .fontSize(12)
          .moveDown()
          .text(`Sender: ${r.sender}`)
          .text(`Message: ${r.message}`)
          .text(`Edited At: ${r.editedAt ? new Date(r.editedAt).toLocaleString() : 'N/A'}`)
          .text(`Attachment: ${r.attachment || 'None'}`)
          .moveDown();
      });
    }

    console.log('Finalizing PDF...');
    doc.end();
    console.log('PDF generation completed successfully');
  } catch (error) {
    console.error("❌ PDF generation error:", error.message);
    res.status(500).json({ message: 'Server error generating PDF' });
  }
}


