import { query } from './index.js';

export interface DbConversation {
  id: number;
  buyer_id: number;
  seller_id: number;
  ad_id: number | null;
  created_at: Date;
  // Joined fields
  other_user_id?: number;
  other_user_name?: string;
  other_user_photo?: string | null;
  ad_title?: string | null;
  last_message?: string | null;
  last_message_at?: Date | null;
  last_message_sender_id?: number | null;
}

export interface DbMessage {
  id: number;
  conversation_id: number;
  sender_id: number;
  message_text: string;
  created_at: Date;
  // Joined fields
  sender_name?: string;
  sender_photo?: string | null;
}

export const createOrGetConversation = async (
  buyerId: number,
  sellerId: number,
  adId: number | null
): Promise<DbConversation> => {
  // Attempt to find an existing conversation first
  const findSql = `
    SELECT * FROM conversations
    WHERE buyer_id = $1 AND seller_id = $2 AND (ad_id = $3 OR ($3 IS NULL AND ad_id IS NULL))
    LIMIT 1
  `;
  const existing = await query(findSql, [buyerId, sellerId, adId]);
  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  // Otherwise create a new one
  const insertSql = `
    INSERT INTO conversations (buyer_id, seller_id, ad_id)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const res = await query(insertSql, [buyerId, sellerId, adId]);
  return res.rows[0];
};

export const getConversationsForUser = async (userId: number): Promise<DbConversation[]> => {
  const sql = `
    SELECT
      c.id,
      c.buyer_id,
      c.seller_id,
      c.ad_id,
      c.created_at,
      CASE WHEN c.buyer_id = $1 THEN c.seller_id ELSE c.buyer_id END AS other_user_id,
      other_u.username AS other_user_name,
      other_u.photo_url AS other_user_photo,
      a.title AS ad_title,
      last_msg.message_text AS last_message,
      last_msg.created_at AS last_message_at,
      last_msg.sender_id AS last_message_sender_id
    FROM conversations c
    JOIN users other_u ON other_u.id = CASE WHEN c.buyer_id = $1 THEN c.seller_id ELSE c.buyer_id END
    LEFT JOIN ads a ON a.id = c.ad_id
    LEFT JOIN LATERAL (
      SELECT message_text, created_at, sender_id
      FROM messages
      WHERE conversation_id = c.id
      ORDER BY created_at DESC
      LIMIT 1
    ) last_msg ON true
    WHERE c.buyer_id = $1 OR c.seller_id = $1
    ORDER BY COALESCE(last_msg.created_at, c.created_at) DESC
  `;
  const res = await query(sql, [userId]);
  return res.rows;
};

export const getMessagesForConversation = async (conversationId: number): Promise<DbMessage[]> => {
  const sql = `
    SELECT
      m.*,
      u.username AS sender_name,
      u.photo_url AS sender_photo
    FROM messages m
    JOIN users u ON u.id = m.sender_id
    WHERE m.conversation_id = $1
    ORDER BY m.created_at ASC
  `;
  const res = await query(sql, [conversationId]);
  return res.rows;
};

export const insertMessage = async (
  conversationId: number,
  senderId: number,
  messageText: string
): Promise<DbMessage> => {
  const sql = `
    INSERT INTO messages (conversation_id, sender_id, message_text)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const res = await query(sql, [conversationId, senderId, messageText]);
  return res.rows[0];
};

export const getConversationById = async (conversationId: number): Promise<DbConversation | null> => {
  const sql = `SELECT * FROM conversations WHERE id = $1`;
  const res = await query(sql, [conversationId]);
  return res.rows[0] || null;
};
