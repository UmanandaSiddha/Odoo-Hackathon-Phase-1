import express from 'express';
import { authenticateUser } from '../middlewares/token.middleware';
import {
    sendMessage,
    getConversations,
    getMessagesForConversation,
    updateMessageStatus,
    searchContacts
} from '../controllers/chat.controller';

const router = express.Router();

// Conversation routes
router.get('/conversations', authenticateUser, getConversations);
router.get('/conversations/:conversationId/messages', authenticateUser, getMessagesForConversation);

// Message routes
router.post('/messages/:recipientId', authenticateUser, sendMessage);
router.patch('/messages/:messageId/status', authenticateUser, updateMessageStatus);

// Contact routes
router.get('/contacts/search', authenticateUser, searchContacts);

export default router;
