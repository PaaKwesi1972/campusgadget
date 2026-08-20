import express from 'express';
import { getReviewsForSeller, createReview } from '../controllers/reviews.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/seller/:sellerId', getReviewsForSeller);
router.post('/listing/:listingId', requireAuth, createReview);

export default router;
