import express from 'express';
import {
  getStats, getPendingVendors, approveVendor, declineVendor,
  getFlaggedListings, removeListing, dismissFlag, flagListing,
  getOpenReports, resolveReport, suspendReportedUser,
} from '../controllers/admin.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';

const router = express.Router();

router.get('/stats', requireAuth, requireAdmin, getStats);
router.get('/vendors/pending', requireAuth, requireAdmin, getPendingVendors);
router.post('/vendors/:id/approve', requireAuth, requireAdmin, approveVendor);
router.post('/vendors/:id/decline', requireAuth, requireAdmin, declineVendor);
router.get('/listings/flagged', requireAuth, requireAdmin, getFlaggedListings);
router.delete('/listings/:id', requireAuth, requireAdmin, removeListing);
router.post('/listings/:id/dismiss-flag', requireAuth, requireAdmin, dismissFlag);
router.post('/listings/:id/flag', requireAuth, flagListing);
router.get('/reports', requireAuth, requireAdmin, getOpenReports);
router.post('/reports/:id/resolve', requireAuth, requireAdmin, resolveReport);
router.post('/reports/:id/suspend', requireAuth, requireAdmin, suspendReportedUser);

export default router;