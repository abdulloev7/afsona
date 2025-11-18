-- Add media field to products table for storing multiple media items
ALTER TABLE products ADD COLUMN IF NOT EXISTS media jsonb DEFAULT '[]'::jsonb;