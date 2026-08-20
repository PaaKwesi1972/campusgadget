import express from 'express';
import {
  getMyConversations,
  getOrCreateConversation,
  getConversationById,
  sendMessage,
} from '../controllers/messages.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', requireAuth, getMyConversations);
router.get('/listing/:listingId', requireAuth, getOrCreateConversation);
router.get('/thread/:conversationId', requireAuth, getConversationById);
router.post('/:conversationId', requireAuth, sendMessage);

export default router;
