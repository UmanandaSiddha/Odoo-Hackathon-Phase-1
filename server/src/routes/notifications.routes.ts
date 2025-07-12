import express from 'express';
import {
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    deleteAllNotifications,
    createNotification
} from '../controllers/notifications.controller';
import { authenticateUser } from '../middlewares/token.middleware';

const router = express.Router();

// Protected routes - require authentication
router.use(authenticateUser);

// Get notifications with filters and pagination
router.get('/', getUserNotifications);

// Mark notifications as read
router.patch('/:id/read', markNotificationAsRead);
router.patch('/read-all', markAllNotificationsAsRead);

// Delete notifications
router.delete('/:id', deleteNotification);
router.delete('/', deleteAllNotifications);

// Create notification (typically used by internal services)
router.post('/', createNotification);

export default router; 