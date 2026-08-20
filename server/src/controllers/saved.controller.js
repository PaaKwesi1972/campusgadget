import pool from '../config/db.js';

// GET all listings the logged-in user has saved
export async function getMySavedItems(req, res) {
  const userId = req.userId;
  try {
    const result = await pool.query(
      `SELECT listings.*, users.full_name AS seller_name
       FROM saved_items
       JOIN listings ON saved_items.listing_id = listings.id
       JOIN users ON listings.seller_id = users.id
       WHERE saved_items.user_id = $1
       ORDER BY saved_items.created_at DESC`,
      [userId]
    );
    res.json({ success: true, savedListings: result.rows });
  } catch (err) {
    console.error('GET SAVED ITEMS ERROR:', err.message);
    res.status(500).json({ success: false, error: 'Could not load saved items.' });
  }
}

// GET just the ids of listings this user has saved (used to show filled hearts on Home/cards)
export async function getMySavedIds(req, res) {
  const userId = req.userId;
  try {
    const result = await pool.query(
      `SELECT listing_id FROM saved_items WHERE user_id = $1`,
      [userId]
    );
    res.json({ success: true, savedIds: result.rows.map(function (r) { return r.listing_id; }) });
  } catch (err) {
    console.error('GET SAVED IDS ERROR:', err.message);
    res.status(500).json({ success: false, error: 'Could not load saved items.' });
  }
}

// POST toggle save/unsave a listing
export async function toggleSaved(req, res) {
  const userId = req.userId;
  const { listingId } = req.params;

  try {
    const existing = await pool.query(
      `SELECT id FROM saved_items WHERE user_id = $1 AND listing_id = $2`,
      [userId, listingId]
    );

    if (existing.rows.length > 0) {
      await pool.query('DELETE FROM saved_items WHERE id = $1', [existing.rows[0].id]);
      return res.json({ success: true, saved: false });
    }

    await pool.query(
      `INSERT INTO saved_items (user_id, listing_id) VALUES ($1, $2)`,
      [userId, listingId]
    );
    res.json({ success: true, saved: true });
  } catch (err) {
    console.error('TOGGLE SAVED ERROR:', err.message);
    res.status(500).json({ success: false, error: 'Could not update saved items.' });
  }
}

