-- Add image_fit column to news table for main image scaling control
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS image_fit text DEFAULT 'cover';

-- Add check constraint for valid values
ALTER TABLE public.news ADD CONSTRAINT news_image_fit_check 
CHECK (image_fit IN ('cover', 'contain'));