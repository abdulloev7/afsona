-- Add text_position column to hero_banners table
ALTER TABLE hero_banners 
ADD COLUMN text_position text DEFAULT 'bottom-left';