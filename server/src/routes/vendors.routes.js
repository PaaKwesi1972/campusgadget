import express from 'express';
import { createVendorApplication, getMyApplication } from '../controllers/vendors.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', requireAuth, createVendorApplication);
router.get('/mine', requireAuth, getMyApplication);

export default router;
