import pool from '../config/db.js';

// POST create a report (any logged-in user, about another user)
export async function createReport(req, res) {
  const reporterId = req.userId;
  const reportedUserId = req.body.reportedUserId;
  const reason = req.body.reason;

  if (!reportedUserId || !reason || !reason.trim()) {
    return res.status(400).json({ success: false, error: 'A reason is required.' });
  }

  if (Number(reporterId) === Number(reportedUserId)) {
    return res.status(400).json({ success: false, error: 'You cannot report yourself.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO user_reports (reporter_id, reported_user_id, reason) VALUES ($1, $2, $3) RETURNING *',
      [reporterId, reportedUserId, reason.trim()]
    );
    res.status(201).json({ success: true, report: result.rows[0] });
  } catch (err) {
    console.error('CREATE REPORT ERROR:', err.message);
    res.status(500).json({ success: false, error: 'Could not submit report.' });
  }
}
