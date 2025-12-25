import express from 'express';
import { getAllSupportTickets, getSupportTicketById, updateSupportTicketStatus, addSupportResponse, editSupportResponse, deleteSupportResponse } from '../controllers/supportTicketController.js';

const router = express.Router();

// List support tickets (optionally filter by status)
router.get('/tickets', getAllSupportTickets);

// Get one ticket with thread
router.get('/tickets/:id', getSupportTicketById);

// Change status
router.patch('/tickets/:id/status', updateSupportTicketStatus);

// Add or overwrite the single response
router.post('/tickets/:id/response', addSupportResponse);
router.put('/tickets/:id/response', editSupportResponse);
router.delete('/tickets/:id/response', deleteSupportResponse);

export default router;
