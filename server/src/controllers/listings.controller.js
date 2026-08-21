import pool from '../config/db.js';

// GET all listings (public — anyone can browse)
export async function getAllListings(req, res) {
  try {
    const result = await pool.query(
      `SELECT listings.*, users.full_name AS seller_name, users.rating AS seller_rating
       FROM listings
       JOIN users ON listings.seller_id = users.id
       WHERE listings.status = 'active'
       ORDER BY listings.created_at DESC`
    );
    res.json({ success: true, listings: result.rows });
  } catch (err) {
    console.error('GET LISTINGS ERROR:', err.message);
    res.status(500).json({ success: false, error: 'Could not load listings.' });
  }
}

// GET a single listing by id (public)
export async function getListingById(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT listings.*, users.full_name AS seller_name, users.rating AS seller_rating
       FROM listings
       JOIN users ON listings.seller_id = users.id
       WHERE listings.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Listing not found.' });
    }
    res.json({ success: true, listing: result.rows[0] });
  } catch (err) {
    console.error('GET LISTING ERROR:', err.message);
    res.status(500).json({ success: false, error: 'Could not load this listing.' });
  }
}

// POST create a new listing (requires login)
export async function createListing(req, res) {
  const { title, description, price, category, condition, imageUrl } = req.body;
  const sellerId = req.userId;

  if (!title || !price || !description) {
    return res.status(400).json({ success: false, error: 'Title, price, and description are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO listings (seller_id, title, description, price, category, condition, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [sellerId, title, description, price, category, condition, imageUrl]
    );
    res.status(201).json({ success: true, listing: result.rows[0] });
  } catch (err) {
    console.error('CREATE LISTING ERROR:', err.message);
    res.status(500).json({ success: false, error: 'Could not publish this listing.' });
  }
}

// GET stats for the logged-in user (listings count, sold count) plus their rating
export async function getMyStats(req, res) {
  const userId = req.userId;
  try {
    const listingsCount = await pool.query(
      `SELECT COUNT(*) FROM listings WHERE seller_id = $1`,
      [userId]
    );
    const soldCount = await pool.query(
      `SELECT COUNT(*) FROM listings WHERE seller_id = $1 AND status = 'sold'`,
      [userId]
    );
    const userResult = await pool.query('SELECT rating FROM users WHERE id = $1', [userId]);

    res.json({
      success: true,
      stats: {
        listingsCount: Number(listingsCount.rows[0].count),
        soldCount: Number(soldCount.rows[0].count),
        rating: Number(userResult.rows[0] ? userResult.rows[0].rating : 0),
      },
    });
  } catch (err) {
    console.error('GET MY STATS ERROR:', err.message);
    res.status(500).json({ success: false, error: 'Could not load your stats.' });
  }
}

// PUT update a listing (only the owner can do this) — now also handles a new photo
export async function updateListing(req, res) {
  const userId = req.userId;
  const { id } = req.params;
  const { title, description, price, category, condition, status, imageUrl } = req.body;

  try {
    const existing = await pool.query('SELECT * FROM listings WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Listing not found.' });
    }
    if (existing.rows[0].seller_id !== userId) {
      return res.status(403).json({ success: false, error: 'You can only edit your own listings.' });
    }

    // Keep the existing photo unless a new one was uploaded
    const finalImageUrl = imageUrl !== undefined && imageUrl !== null ? imageUrl : existing.rows[0].image_url;

    const result = await pool.query(
      `UPDATE listings
       SET title = $1, description = $2, price = $3, category = $4, condition = $5, status = $6, image_url = $7
       WHERE id = $8
       RETURNING *`,
      [title, description, price, category, condition, status, finalImageUrl, id]
    );

    res.json({ success: true, listing: result.rows[0] });
  } catch (err) {
    console.error('UPDATE LISTING ERROR:', err.message);
    res.status(500).json({ success: false, error: 'Could not update this listing.' });
  }
}

// DELETE a listing (only the owner can do this)
export async function deleteListing(req, res) {
  const userId = req.userId;
  const { id } = req.params;

  try {
    const existing = await pool.query('SELECT * FROM listings WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Listing not found.' });
    }
    if (existing.rows[0].seller_id !== userId) {
      return res.status(403).json({ success: false, error: 'You can only delete your own listings.' });
    }

    await pool.query('DELETE FROM listings WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE LISTING ERROR:', err.message);
    res.status(500).json({ success: false, error: 'Could not delete this listing.' });
  }
}
