import express from 'express';
import { signUp, login, verifyOtp, resendOtp } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/signup', signUp);
router.post('/login', login);
router.post('/verify-otp', requireAuth, verifyOtp);
router.post('/resend-otp', requireAuth, resendOtp);

export default router;

