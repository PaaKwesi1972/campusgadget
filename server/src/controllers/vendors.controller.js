import pool from '../config/db.js';

// POST a new vendor application (requires login)
export async function createVendorApplication(req, res) {
  const userId = req.userId;
  const { businessName, contactEmail, phone, description, documentUrl } = req.body;

  if (!businessName || !contactEmail || !phone || !description) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }

  try {
    // Prevent duplicate pending applications from the same user
    const existing = await pool.query(
      `SELECT id FROM vendor_applications WHERE user_id = $1 AND status = 'pending'`,
      [userId]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, error: 'You already have a pending application.' });
    }

    const result = await pool.query(
      `INSERT INTO vendor_applications (user_id, business_name, contact_email, phone, description, document_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [userId, businessName, contactEmail, phone, description, documentUrl || null]
    );

    res.status(201).json({ success: true, application: result.rows[0] });
  } catch (err) {
    console.error('CREATE VENDOR APPLICATION ERROR:', err.message);
    res.status(500).json({ success: false, error: 'Could not submit your application.' });
  }
}

// GET the logged-in user's own application status
export async function getMyApplication(req, res) {
  const userId = req.userId;
  try {
    const result = await pool.query(
      `SELECT * FROM vendor_applications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    res.json({ success: true, application: result.rows[0] || null });
  } catch (err) {
    console.error('GET MY APPLICATION ERROR:', err.message);
    res.status(500).json({ success: false, error: 'Could not load your application.' });
  }
}