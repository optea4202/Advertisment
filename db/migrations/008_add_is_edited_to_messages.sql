-- Add is_edited flag to messages to track which messages have been edited by the sender
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_edited BOOLEAN NOT NULL DEFAULT FALSE;
