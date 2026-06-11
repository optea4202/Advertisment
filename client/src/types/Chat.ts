export interface Conversation {
  id: number;
  buyer_id: number;
  seller_id: number;
  ad_id: number | null;
  created_at: string;
  other_user_id: number;
  other_user_name: string;
  other_user_photo: string | null;
  ad_title: string | null;
  last_message: string | null;
  last_message_at: string | null;
  last_message_sender_id: number | null;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  message_text: string;
  image_url: string | null;
  is_edited: boolean;
  created_at: string;
  sender_name: string;
  sender_photo: string | null;
}

