import express from 'express';
import {
  giveFeedback,
  deleteFeedback,
} from '../controllers/feedback.controller';

import { authenticateUser } from '../middlewares/token.middleware';

const router = express.Router();

// POST /api/feedback/:userId - Give feedback to a user
router.post('/:userId', authenticateUser, giveFeedback);

// DELETE /api/feedback/:feedbackId - Delete feedback (optional)
router.delete('/:feedbackId/:userId', authenticateUser, deleteFeedback);

export default router;
