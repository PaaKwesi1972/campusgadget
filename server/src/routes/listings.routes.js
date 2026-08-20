import express from 'express';
import { getAllListings, getListingById, createListing, getMyStats, updateListing, deleteListing } from '../controllers/listings.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getAllListings);
router.get('/my-stats', requireAuth, getMyStats);
router.get('/:id', getListingById);
router.post('/', requireAuth, createListing);
router.put('/:id', requireAuth, updateListing);
router.delete('/:id', requireAuth, deleteListing);

export default router;