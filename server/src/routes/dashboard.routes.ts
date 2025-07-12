import express from 'express';
import {
    getDashboardUsers,
    sendSwapRequest,
    acceptSwapRequest,
    deleteSwapRequest,
    getMyRequests
} from '../controllers/dashboard.controller';

const router = express.Router();

//  Dashboard view - public users (GET)
router.get('/dashboard', getDashboardUsers);

//  View all sent/received requests (GET)
router.get('/me', getMyRequests);

//  Send a new request (POST)
router.post('/', sendSwapRequest);

//  Accept a request (PATCH)
router.patch('/:id/accept', acceptSwapRequest);

//  Delete a request (DELETE)
router.delete('/:id', deleteSwapRequest);

export default router;
