-- Add optional image_url column to messages for photo sharing in chat
ALTER TABLE messages ADD COLUMN IF NOT EXISTS image_url TEXT;
