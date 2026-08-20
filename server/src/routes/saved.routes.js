import express from 'express';
import { getMySavedItems, getMySavedIds, toggleSaved } from '../controllers/saved.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', requireAuth, getMySavedItems);
router.get('/ids', requireAuth, getMySavedIds);
router.post('/:listingId/toggle', requireAuth, toggleSaved);

export default router;

