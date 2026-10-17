-- Optional phone version of a hero banner (portrait 4:5) with its own focal point.
-- Nullable/defaulted, so existing banners and the current site keep working unchanged.
ALTER TABLE public.hero_banners
  ADD COLUMN IF NOT EXISTS mobile_image_url text,
  ADD COLUMN IF NOT EXISTS mobile_image_position_x numeric DEFAULT 50,
  ADD COLUMN IF NOT EXISTS mobile_image_position_y numeric DEFAULT 50;
