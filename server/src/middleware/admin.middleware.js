import pool from '../config/db.js';

// Runs after requireAuth — checks the logged-in user is actually flagged as an admin
export async function requireAdmin(req, res, next) {
  try {
    const result = await pool.query('SELECT user_type FROM users WHERE id = $1', [req.userId]);
    if (result.rows.length === 0 || result.rows[0].user_type !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required.' });
    }
    next();
  } catch (err) {
    console.error('ADMIN CHECK ERROR:', err.message);
    res.status(500).json({ success: false, error: 'Could not verify admin access.' });
  }
}

