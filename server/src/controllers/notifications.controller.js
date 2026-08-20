import pool from '../config/db.js';

// GET all notifications for the logged-in user, then mark them as read
export async function getMyNotifications(req, res) {
  const userId = req.userId;
  try {
    const result = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    // Mark everything as read now that they've viewed the list
    await pool.query(
      `UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE`,
      [userId]
    );

    res.json({ success: true, notifications: result.rows });
  } catch (err) {
    console.error('GET NOTIFICATIONS ERROR:', err.message);
    res.status(500).json({ success: false, error: 'Could not load notifications.' });
  }
}

// GET just the unread count (used for the badge, without marking as read)
export async function getUnreadCount(req, res) {
  const userId = req.userId;
  try {
    const result = await pool.query(
      `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
      [userId]
    );
    res.json({ success: true, count: Number(result.rows[0].count) });
  } catch (err) {
    console.error('GET UNREAD COUNT ERROR:', err.message);
    res.status(500).json({ success: false, error: 'Could not load notification count.' });
  }
}

// Internal helper — call this from other controllers when something notification-worthy happens
export async function createNotification(userId, type, title, body, relatedId = null) {
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, body, related_id) VALUES ($1, $2, $3, $4, $5)`,
      [userId, type, title, body, relatedId]
    );
  } catch (err) {
    console.error('CREATE NOTIFICATION ERROR:', err.message);
  }
}

