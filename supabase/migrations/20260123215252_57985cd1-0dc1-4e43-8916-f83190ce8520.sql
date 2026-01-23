-- Add image position and scale columns for banner background positioning
ALTER TABLE public.hero_banners
ADD COLUMN IF NOT EXISTS image_position_x numeric DEFAULT 50,
ADD COLUMN IF NOT EXISTS image_position_y numeric DEFAULT 50,
ADD COLUMN IF NOT EXISTS image_scale numeric DEFAULT 100;

-- Add comments for documentation
COMMENT ON COLUMN public.hero_banners.image_position_x IS 'Horizontal position of background image (0-100%)';
COMMENT ON COLUMN public.hero_banners.image_position_y IS 'Vertical position of background image (0-100%)';
COMMENT ON COLUMN public.hero_banners.image_scale IS 'Scale/zoom of background image (100 = 100%)';