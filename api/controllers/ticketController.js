import PDFDocument from 'pdfkit';
import Ticket from '../models/ticketModel.js';
import path from 'path';
import { fileURLToPath } from 'url';





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
    const { name, email, subject, inquiryType, description } = req.body;
    // If a file was uploaded, build a public URL
    let attachment = undefined;
    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      attachment = `${baseUrl}/uploads/${req.file.filename}`;
    }

    // Manually validate required fields (optional but good UX)
    if (!name || !email || !subject || !inquiryType || !description) {
      return res.status(400).json({
        error: "❌ Missing required fields"
      });
    }

    // Create new Ticket document
    const newTicket = new Ticket({ name, email, subject, inquiryType, description, attachment });

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
    const { name,email,subject,inquiryType,description } = req.body
    let attachment = req.body.attachment;
    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      attachment = `${baseUrl}/uploads/${req.file.filename}`;
    }
    const isAdmin = req.headers['x-admin-secret'] && req.headers['x-admin-secret'] === (process.env.ADMIN_SECRET || 'change-me-in-prod');
    const userEmail = req.headers['x-user-email'];

    const existing = await Ticket.findById(req.params.id);
    if(!existing) return res.status(404).json({ message: "❌ Ticket not found" });

    if (!isAdmin && (!userEmail || existing.email !== userEmail)) {
      return res.status(403).json({ message: 'Forbidden: not your ticket' });
    }

    // Enforce 3-hour window for user-initiated updates (admins bypass)
    if (!isAdmin) {
      const createdAt = new Date(existing.createdAt).getTime();
      const now = Date.now();
      const threeHoursMs = 3 * 60 * 60 * 1000;
      if (now - createdAt > threeHoursMs) {
        return res.status(403).json({
          message: 'Update window expired: tickets can only be updated within 3 hours of creation.'
        });
      }
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
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ticket-${ticket._id}.pdf"`);

    console.log('Setting up PDF stream...');
    // Pipe the PDF into the response
    doc.pipe(res);

    // Header
    doc
      .fontSize(22)
      .fillColor('#1f2937')
      .text('Support Ticket Report', { align: 'left' });
    doc.moveDown(0.25);
    doc
      .fontSize(14)
      .fillColor('#4b5563')
      .text(`Ticket: ${ticket.subject}`);

    // Separator
    doc.moveDown(0.5);
    doc
      .moveTo(50, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .strokeColor('#e5e7eb')
      .stroke();
    doc.moveDown();

    // Metadata
    const asLocal = (d) => new Date(d).toLocaleString();
    doc.fontSize(12).fillColor('#111827');
    doc.text(`From: ${ticket.name} <${ticket.email}>`);
    doc.text(`Type: ${ticket.inquiryType}`);
    doc.text(`Status: ${ticket.status}`);
    doc.text(`Created: ${asLocal(ticket.createdAt)}`);
    doc.text(`Updated: ${asLocal(ticket.updatedAt)}`);
    doc.moveDown();

    // Description
    doc
      .fontSize(13)
      .fillColor('#1f2937')
      .text('Description', { underline: true });
    doc
      .fontSize(12)
      .fillColor('#111827')
      .text(ticket.description || 'No description provided.', { align: 'left' });

    // Try to embed main attachment if present
    const tryEmbedAttachment = (attachmentUrl, label = 'Attachment') => {
      if (!attachmentUrl) return;
      try {
        const urlObj = new URL(attachmentUrl);
        const filename = path.basename(urlObj.pathname);
        const uploadsPath = path.join(path.resolve(), 'uploads', filename);
        const lower = filename.toLowerCase();
        const isImage = lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.gif') || lower.endsWith('.webp');

        doc.moveDown();
        doc.fontSize(12).fillColor('#1f2937').text(label, { underline: true });
        doc.fontSize(11).fillColor('#2563eb').text(attachmentUrl, { link: attachmentUrl, underline: true });

        if (isImage) {
          doc.moveDown(0.5);
          try {
            doc.image(uploadsPath, { fit: [400, 300], align: 'left' });
          } catch (e) {
            // If embedding fails, still keep the link
            console.warn('Could not embed image, kept link only:', e.message);
          }
        }
      } catch (e) {
        console.warn('Attachment handling error:', e.message);
      }
    };

    if (ticket.attachment) {
      tryEmbedAttachment(ticket.attachment, 'User Attachment');
    }

    // Responses section
    if (ticket.responses && ticket.responses.length > 0) {
      doc.addPage();
      doc.fontSize(16).fillColor('#1f2937').text('Responses', { underline: true });
      doc.moveDown(0.5);

      ticket.responses.forEach((r, index) => {
        const header = `#${index + 1} • ${r.sender === 'admin' ? 'Admin' : 'User'} response`;
        doc
          .fontSize(13)
          .fillColor('#111827')
          .text(header);

        const ts = r.editedAt ? asLocal(r.editedAt) + ' (edited)' : asLocal(ticket.createdAt);
        doc.fontSize(10).fillColor('#6b7280').text(ts);
        doc.moveDown(0.25);

        doc.fontSize(12).fillColor('#111827').text(r.message || '-', { align: 'left' });

        if (r.attachment) {
          tryEmbedAttachment(r.attachment, 'Response Attachment');
        }

        // Divider between responses
        if (index < ticket.responses.length - 1) {
          doc.moveDown(0.5);
          doc
            .moveTo(50, doc.y)
            .lineTo(doc.page.width - 50, doc.y)
            .strokeColor('#e5e7eb')
            .stroke();
          doc.moveDown(0.5);
        }
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


