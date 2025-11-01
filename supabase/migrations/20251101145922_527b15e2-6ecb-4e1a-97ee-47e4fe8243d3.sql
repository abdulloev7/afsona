-- Add image_fit column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_fit text DEFAULT 'cover' CHECK (image_fit IN ('cover', 'contain'));