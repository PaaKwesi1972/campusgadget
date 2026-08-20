import pool from '../config/db.js';
import { createNotification } from './notifications.controller.js';

// GET all conversations for the logged-in user (their inbox), with last message info
export async function getMyConversations(req, res) {
  const userId = req.userId;
  try {
    const result = await pool.query(
      `SELECT
         conversations.id,
         conversations.listing_id,
         listings.title AS listing_title,
         CASE
           WHEN conversations.buyer_id = $1 THEN seller.full_name
           ELSE buyer.full_name
         END AS other_user_name,
         CASE
           WHEN conversations.buyer_id = $1 THEN conversations.seller_id
           ELSE conversations.buyer_id
         END AS other_user_id,
         last_msg.sender_id AS last_sender_id,
         last_msg.text AS last_message_text,
         last_msg.created_at AS last_message_at
       FROM conversations
       JOIN listings ON conversations.listing_id = listings.id
       JOIN users buyer ON conversations.buyer_id = buyer.id
       JOIN users seller ON conversations.seller_id = seller.id
       LEFT JOIN LATERAL (
         SELECT sender_id, text, created_at FROM messages
         WHERE messages.conversation_id = conversations.id
         ORDER BY created_at DESC LIMIT 1
       ) last_msg ON true
       WHERE conversations.buyer_id = $1 OR conversations.seller_id = $1
       ORDER BY last_msg.created_at DESC NULLS LAST`,
      [userId]
    );
    res.json({ success: true, conversations: result.rows });
  } catch (err) {
    console.error('GET CONVERSATIONS ERROR:', err.message);
    res.status(500).json({ success: false, error: 'Could not load conversations.' });
  }
}

export async function getOrCreateConversation(req, res) {
  const userId = req.userId;
  const { listingId } = req.params;

  try {
    const listingResult = await pool.query('SELECT * FROM listings WHERE id = $1', [listingId]);
    if (listingResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Listing not found.' });
    }
    const listing = listingResult.rows[0];
    const sellerId = listing.seller_id;

    if (Number(userId) === Number(sellerId)) {
      return res.status(400).json({ success: false, error: 'You cannot message yourself about your own listing.' });
    }

    let convoResult = await pool.query(
      `SELECT * FROM conversations WHERE listing_id = $1 AND buyer_id = $2 AND seller_id = $3`,
      [listingId, userId, sellerId]
    );

    let conversation;
    if (convoResult.rows.length > 0) {
      conversation = convoResult.rows[0];
    } else {
      const newConvo = await pool.query(
        `INSERT INTO conversations (listing_id, buyer_id, seller_id) VALUES ($1, $2, $3) RETURNING *`,
        [listingId, userId, sellerId]
      );
      conversation = newConvo.rows[0];
    }

    const messagesResult = await pool.query(
      `SELECT messages.*, users.full_name AS sender_name
       FROM messages
       JOIN users ON messages.sender_id = users.id
       WHERE conversation_id = $1
       ORDER BY messages.created_at ASC`,
      [conversation.id]
    );

    res.json({
      success: true,
      conversation: { ...conversation, listing_title: listing.title },
      messages: messagesResult.rows,
    });
  } catch (err) {
    console.error('GET/CREATE CONVERSATION ERROR:', err.message);
    res.status(500).json({ success: false, error: 'Could not open this conversation.' });
  }
}

export async function getConversationById(req, res) {
  const userId = req.userId;
  const { conversationId } = req.params;

  try {
    const convoResult = await pool.query(
      `SELECT conversations.*, listings.title AS listing_title
       FROM conversations
       JOIN listings ON conversations.listing_id = listings.id
       WHERE conversations.id = $1 AND (conversations.buyer_id = $2 OR conversations.seller_id = $2)`,
      [conversationId, userId]
    );

    if (convoResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Conversation not found.' });
    }
    const conversation = convoResult.rows[0];

    const messagesResult = await pool.query(
      `SELECT messages.*, users.full_name AS sender_name
       FROM messages
       JOIN users ON messages.sender_id = users.id
       WHERE conversation_id = $1
       ORDER BY messages.created_at ASC`,
      [conversationId]
    );

    res.json({ success: true, conversation, messages: messagesResult.rows });
  } catch (err) {
    console.error('GET CONVERSATION BY ID ERROR:', err.message);
    res.status(500).json({ success: false, error: 'Could not open this conversation.' });
  }
}

export async function sendMessage(req, res) {
  const userId = req.userId;
  const { conversationId } = req.params;
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ success: false, error: 'Message cannot be empty.' });
  }

  try {
    const convoCheck = await pool.query(
      `SELECT * FROM conversations WHERE id = $1 AND (buyer_id = $2 OR seller_id = $2)`,
      [conversationId, userId]
    );
    if (convoCheck.rows.length === 0) {
      return res.status(403).json({ success: false, error: 'You are not part of this conversation.' });
    }

    const result = await pool.query(
      `INSERT INTO messages (conversation_id, sender_id, text) VALUES ($1, $2, $3) RETURNING *`,
      [conversationId, userId, text.trim()]
    );

    // Notify the OTHER person in this conversation, not the sender
    const convo = convoCheck.rows[0];
    const recipientId = convo.buyer_id === userId ? convo.seller_id : convo.buyer_id;
    const senderResult = await pool.query('SELECT full_name FROM users WHERE id = $1', [userId]);
    const senderName = senderResult.rows[0]?.full_name || 'Someone';

    await createNotification(
      recipientId,
      'message',
      `New message from ${senderName}`,
      text.trim().length > 60 ? text.trim().slice(0, 60) + '...' : text.trim(),
      convo.listing_id
    );

    res.status(201).json({ success: true, message: result.rows[0] });
  } catch (err) {
    console.error('SEND MESSAGE ERROR:', err.message);
    res.status(500).json({ success: false, error: 'Could not send message.' });
  }
}

