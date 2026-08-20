import pool from '../config/db.js';

// --- Dashboard stats ---
export async function getStats(req, res) {
  try {
    const pendingVendors = await pool.query(
      `SELECT COUNT(*) FROM vendor_applications WHERE status = 'pending'`
    );
    const flaggedListings = await pool.query(
      `SELECT COUNT(*) FROM listings WHERE is_flagged = true`
    );
    const activeUsers = await pool.query(`SELECT COUNT(*) FROM users`);

    res.json({
      success: true,
      stats: {
        pendingVendors: Number(pendingVendors.rows[0].count),
        flaggedListings: Number(flaggedListings.rows[0].count),
        activeUsers: Number(activeUsers.rows[0].count),
      },
    });
  } catch (err) {
    console.error('GET STATS ERROR:', err.message);
    res.status(500).json({ success: false, error: 'Could not load stats.' });
  }
}

// --- Vendors tab ---
export async function getPendingVendors(req, res) {
  try {
    const result = await pool.query(
      `SELECT vendor_applications.*, users.email AS user_email
       FROM vendor_applications
       JOIN users ON vendor_applications.user_id = users.id
       WHERE vendor_applications.status = 'pending'
       ORDER BY vendor_applications.created_at DESC`
    );
    res.json({ success: true, vendors: result.rows });
  } catch (err) {
    console.error('GET PENDING VENDORS ERROR:', err.message);
    res.status(500).json({ success: false, error: 'Could not load vendor applications.' });
  }
}

export async function approveVendor(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE vendor_applications SET status = 'approved' WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Application not found.' });
    }
    // Mark the underlying user as verified now that they're an approved vendor
    await pool.query('UPDATE users SET is_verified = true WHERE id = $1', [result.rows[0].user_id]);

    res.json({ success: true, application: result.rows[0] });
  } catch (err) {
    console.error('APPROVE VENDOR ERROR:', err.message);
    res.status(500).json({ success: false, error: 'Could not approve this application.' });
  }
}

export async function declineVendor(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE vendor_applications SET status = 'declined' WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Application not found.' });
    }
    res.json({ success: true, application: result.rows[0] });
  } catch (err) {
    console.error('DECLINE VENDOR ERROR:', err.message);
    res.status(500).json({ success: false, error: 'Could not decline this application.' });
  }
}

// --- Listings tab ---
export async function getFlaggedListings(req, res) {
  try {
    const result = await pool.query(
      `SELECT listings.*, users.full_name AS seller_name
       FROM listings
       JOIN users ON listings.seller_id = users.id
       WHERE listings.is_flagged = true
       ORDER BY listings.created_at DESC`
    );
    res.json({ success: true, listings: result.rows });
  } catch (err) {
    console.error('GET FLAGGED LISTINGS ERROR:', err.message);
    res.status(500).json({ success: false, error: 'Could not load flagged listings.' });
  }
}

export async function removeListing(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM listings WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Listing not found.' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('REMOVE LISTING ERROR:', err.message);
    res.status(500).json({ success: false, error: 'Could not remove this listing.' });
  }
}

export async function dismissFlag(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE listings SET is_flagged = false WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Listing not found.' });
    }
    res.json({ success: true, listing: result.rows[0] });
  } catch (err) {
    console.error('DISMISS FLAG ERROR:', err.message);
    res.status(500).json({ success: false, error: 'Could not dismiss this flag.' });
  }
}

// --- Simple listing flag endpoint, usable by any logged-in user (not admin-only) ---
export async function flagListing(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE listings SET is_flagged = true WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Listing not found.' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('FLAG LISTING ERROR:', err.message);
    res.status(500).json({ success: false, error: 'Could not flag this listing.' });
  }
}

// --- Reports tab ---
export async function getOpenReports(req, res) {
  try {
    const result = await pool.query(
      'SELECT user_reports.*, reporter.full_name AS reporter_name, reported.full_name AS reported_name ' +
      'FROM user_reports ' +
      'JOIN users reporter ON user_reports.reporter_id = reporter.id ' +
      'JOIN users reported ON user_reports.reported_user_id = reported.id ' +
      "WHERE user_reports.status = 'open' " +
      'ORDER BY user_reports.created_at DESC'
    );
    res.json({ success: true, reports: result.rows });
  } catch (err) {
    console.error('GET OPEN REPORTS ERROR:', err.message);
    res.status(500).json({ success: false, error: 'Could not load reports.' });
  }
}

export async function resolveReport(req, res) {
  const id = req.params.id;
  try {
    const result = await pool.query(
      "UPDATE user_reports SET status = 'resolved' WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Report not found.' });
    }
    res.json({ success: true, report: result.rows[0] });
  } catch (err) {
    console.error('RESOLVE REPORT ERROR:', err.message);
    res.status(500).json({ success: false, error: 'Could not resolve this report.' });
  }
}

export async function suspendReportedUser(req, res) {
  const id = req.params.id;
  try {
    const reportResult = await pool.query('SELECT * FROM user_reports WHERE id = $1', [id]);
    if (reportResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Report not found.' });
    }
    const report = reportResult.rows[0];

    await pool.query('UPDATE users SET is_suspended = true WHERE id = $1', [report.reported_user_id]);
    const updatedReport = await pool.query(
      "UPDATE user_reports SET status = 'suspended' WHERE id = $1 RETURNING *",
      [id]
    );

    res.json({ success: true, report: updatedReport.rows[0] });
  } catch (err) {
    console.error('SUSPEND USER ERROR:', err.message);
    res.status(500).json({ success: false, error: 'Could not suspend this user.' });
  }
}
