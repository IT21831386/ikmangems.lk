import express from 'express';
import {
  getAllFAQs,
  getFAQ,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  toggleFAQStatus,
  getFAQStats
} from '../controllers/faqController.js';
import userAuth from '../middleware/userAuth.js';
import { authorizeRoles } from '../middleware/userAuth.js';

const router = express.Router();

// Public routes
router.get('/', getAllFAQs);
router.get('/stats', getFAQStats);
router.get('/:id', getFAQ);

// Protected routes (Admin only)
router.post('/', userAuth, authorizeRoles('admin', 'Admin'), createFAQ);
router.put('/:id', userAuth, authorizeRoles('admin', 'Admin'), updateFAQ);
router.delete('/:id', userAuth, authorizeRoles('admin', 'Admin'), deleteFAQ);
router.patch('/:id/toggle', userAuth, authorizeRoles('admin', 'Admin'), toggleFAQStatus);

export default router;
