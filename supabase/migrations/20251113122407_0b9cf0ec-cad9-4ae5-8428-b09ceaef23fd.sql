-- Add archived column to products table
ALTER TABLE products ADD COLUMN archived boolean DEFAULT false NOT NULL;

-- Add index for better performance when filtering by archived status
CREATE INDEX idx_products_archived ON products(archived);