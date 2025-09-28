// src/routes/TicketRoute.js — ✅ FIXED
//pass-: cijY2BROI1V8rFST

import express from "express";
import {
  getAllTickets,
  createTicket,
  updateTicket,
  deleteTicket,
  getTicketById
} from "../controllers/ticketController.js";

const router = express.Router();

// Routes
router.get('/', getAllTickets);
router.post('/', createTicket);
router.put('/:id', updateTicket);
router.delete('/:id', deleteTicket);
router.get('/:id', getTicketById);


// ✅ Make sure only this one default export exists
export default router;


//mongodb+srv://thinubeligaswaththa_db_user:cijY2BROI1V8rFST@cluster0.ufb69bo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0