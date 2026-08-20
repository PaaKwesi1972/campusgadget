import express from 'express';
import { getMyNotifications, getUnreadCount } from '../controllers/notifications.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', requireAuth, getMyNotifications);
router.get('/unread-count', requireAuth, getUnreadCount);

export default router;

