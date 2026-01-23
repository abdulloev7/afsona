-- Remove old unique constraint that prevents multiple variants
ALTER TABLE cart_items 
DROP CONSTRAINT IF EXISTS cart_items_user_id_product_id_key;

-- Create new unique constraint that allows different sizes
CREATE UNIQUE INDEX IF NOT EXISTS cart_items_user_product_size_unique 
ON cart_items (user_id, product_id, COALESCE(selected_size, ''));

-- Clean up any cart items without selected_size for products that have variants
DELETE FROM cart_items 
WHERE selected_size IS NULL 
AND product_id IN (
  SELECT id FROM products WHERE size_variants IS NOT NULL AND jsonb_array_length(size_variants) > 0
);