import { Router } from 'express';
import { sendMessage, getConversations, getMessagesForConversation } from '../controllers/chat.controller';
import { authenticateUser } from '../middlewares/token.middleware';

const router = Router();

router.use(authenticateUser);

router.post('/send/:recipientId', sendMessage);
router.get('/conversations', getConversations);
router.get('/:conversationId', getMessagesForConversation);

export default router;
