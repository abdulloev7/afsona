-- Add precise positioning columns for banner text
ALTER TABLE hero_banners 
ADD COLUMN text_position_x numeric DEFAULT 25,
ADD COLUMN text_position_y numeric DEFAULT 85;