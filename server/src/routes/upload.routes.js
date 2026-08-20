import express from 'express';
import multer from 'multer';
import { storage, documentStorage } from '../config/cloudinary.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const uploadImage = multer({ storage });
const uploadDocument = multer({ storage: documentStorage });
const router = express.Router();

router.post('/', requireAuth, uploadImage.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No image was uploaded.' });
  }
  res.json({ success: true, imageUrl: req.file.path });
});

router.post('/document', requireAuth, uploadDocument.single('document'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No document was uploaded.' });
  }
  res.json({ success: true, documentUrl: req.file.path });
});

export default router;

