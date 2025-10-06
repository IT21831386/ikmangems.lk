// src/routes/TicketRoute.js — ✅ FIXED
//pass-: cijY2BROI1V8rFST

import express from "express";
import {
  getAllTickets,
  createTicket,
  updateTicket,
  deleteTicket,
  getTicketById,
  generateTicketPDF // ✅ NEW
} from "../controllers/ticketController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Routes
router.get('/', getAllTickets);
router.post('/', upload.single('attachment'), createTicket);
router.put('/:id', upload.single('attachment'), updateTicket);
router.delete('/:id', deleteTicket);

// ✅ Route for generating PDF - MUST come before /:id route
router.get('/:id/pdf', generateTicketPDF);
router.get('/:id', getTicketById);


// ✅ Make sure only this one default export exists
export default router;


//mongodb+srv://thinubeligaswaththa_db_user:cijY2BROI1V8rFST@cluster0.ufb69bo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0