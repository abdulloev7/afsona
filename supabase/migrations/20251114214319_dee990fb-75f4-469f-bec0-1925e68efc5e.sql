-- Add selected_size column to cart_items table
ALTER TABLE cart_items 
ADD COLUMN selected_size text;

-- Add selected_size column to order_items table
ALTER TABLE order_items 
ADD COLUMN selected_size text;

-- Add index on (user_id, product_id, selected_size) in cart_items for proper cart item uniqueness
CREATE INDEX idx_cart_items_user_product_size ON cart_items(user_id, product_id, selected_size);

-- Add comment for clarity
COMMENT ON COLUMN cart_items.selected_size IS 'Selected product size/volume when adding to cart';
COMMENT ON COLUMN order_items.selected_size IS 'Selected product size/volume in the order';