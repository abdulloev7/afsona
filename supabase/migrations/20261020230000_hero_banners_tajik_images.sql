-- Tajik versions of hero banner images, shown on /tg. Empty = Russian image is used.
ALTER TABLE public.hero_banners
  ADD COLUMN IF NOT EXISTS image_url_tg text,
  ADD COLUMN IF NOT EXISTS mobile_image_url_tg text;
