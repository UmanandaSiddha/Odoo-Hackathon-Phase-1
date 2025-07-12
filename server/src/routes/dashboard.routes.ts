import express from 'express';
import { getDashboardStats, getDashboardUsers } from '../controllers/dashboard.controller';
import { authenticateUser } from '../middlewares/token.middleware';

const router = express.Router();

router.get('/stats', authenticateUser, getDashboardStats);
router.get('/users', authenticateUser, getDashboardUsers);

export default router;
