import express from 'express';
import { 
    acceptSwapRequest, 
    completeSwap, 
    getDashboardStats, 
    getDashboardUsers, 
    sendSwapRequest,
    getSwapStats,
    getSwaps,
    deleteSwapRequest,
    getMyRequests
} from '../controllers/dashboard.controller';
import { authenticateUser } from '../middlewares/token.middleware';

const router = express.Router();

// Dashboard stats and users
router.get('/stats', authenticateUser, getDashboardStats);
router.get('/users', authenticateUser, getDashboardUsers);

// Swap stats and listings
router.get('/swaps/stats', authenticateUser, getSwapStats);
router.get('/swaps', authenticateUser, getSwaps);

// Swap request management
router.get('/requests', authenticateUser, getMyRequests);
router.post('/requests', authenticateUser, sendSwapRequest);
router.patch('/requests/:id/accept', authenticateUser, acceptSwapRequest);
router.patch('/requests/:id/complete', authenticateUser, completeSwap);
router.delete('/requests/:id', authenticateUser, deleteSwapRequest);

export default router;
