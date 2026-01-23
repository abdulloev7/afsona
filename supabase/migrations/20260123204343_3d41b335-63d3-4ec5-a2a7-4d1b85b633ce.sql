-- Add separate position columns for title, subtitle, and button
ALTER TABLE public.hero_banners 
ADD COLUMN title_position_x numeric DEFAULT 25,
ADD COLUMN title_position_y numeric DEFAULT 70,
ADD COLUMN subtitle_position_x numeric DEFAULT 25,
ADD COLUMN subtitle_position_y numeric DEFAULT 78,
ADD COLUMN button_position_x numeric DEFAULT 25,
ADD COLUMN button_position_y numeric DEFAULT 88;