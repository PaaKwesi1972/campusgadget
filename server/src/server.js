import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import listingsRoutes from './routes/listings.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import messagesRoutes from './routes/messages.routes.js';
import reviewsRoutes from './routes/reviews.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import vendorsRoutes from './routes/vendors.routes.js';
import adminRoutes from './routes/admin.routes.js';
import savedRoutes from './routes/saved.routes.js';
import reportsRoutes from './routes/reports.routes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'CampusGadget API is running' });
});

app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0].now });
  } catch (err) {
    console.error('DATABASE ERROR:', err.message);
    res.status(500).json({ success: false, error: err.message, code: err.code });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/vendors', vendorsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/reports', reportsRoutes);

app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err.message);
  res.status(500).json({ success: false, error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});