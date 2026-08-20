import pool from '../config/db.js';
import { createNotification } from './notifications.controller.js';

export async function getReviewsForSeller(req, res) {
  const { sellerId } = req.params;
  try {
    const result = await pool.query(
      `SELECT reviews.*, reviewer.full_name AS reviewer_name
       FROM reviews
       JOIN users reviewer ON reviews.reviewer_id = reviewer.id
       WHERE reviews.seller_id = $1
       ORDER BY reviews.created_at DESC`,
      [sellerId]
    );
    res.json({ success: true, reviews: result.rows });
  } catch (err) {
    console.error('GET REVIEWS ERROR:', err.message);
    res.status(500).json({ success: false, error: 'Could not load reviews.' });
  }
}

export async function createReview(req, res) {
  const reviewerId = req.userId;
  const { listingId } = req.params;
  const { rating, text } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, error: 'A rating between 1 and 5 is required.' });
  }

  try {
    const listingResult = await pool.query('SELECT * FROM listings WHERE id = $1', [listingId]);
    if (listingResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Listing not found.' });
    }
    const sellerId = listingResult.rows[0].seller_id;

    if (Number(reviewerId) === Number(sellerId)) {
      return res.status(400).json({ success: false, error: 'You cannot review your own listing.' });
    }

    const reviewResult = await pool.query(
      `INSERT INTO reviews (listing_id, reviewer_id, seller_id, rating, text)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [listingId, reviewerId, sellerId, rating, text || null]
    );

    const avgResult = await pool.query(
      `SELECT ROUND(AVG(rating)::numeric, 1) AS avg_rating FROM reviews WHERE seller_id = $1`,
      [sellerId]
    );
    const newAverage = avgResult.rows[0].avg_rating;

    await pool.query('UPDATE users SET rating = $1 WHERE id = $2', [newAverage, sellerId]);

    // Notify the seller they just got reviewed
    const reviewerResult = await pool.query('SELECT full_name FROM users WHERE id = $1', [reviewerId]);
    const reviewerName = reviewerResult.rows[0]?.full_name || 'A student';

    await createNotification(
      sellerId,
      'review',
      `${reviewerName} left you a ${rating}-star review`,
      text || null,
      listingId
    );

    res.status(201).json({ success: true, review: reviewResult.rows[0], newSellerRating: newAverage });
  } catch (err) {
    console.error('CREATE REVIEW ERROR:', err.message);
    res.status(500).json({ success: false, error: 'Could not submit review.' });
  }
}
