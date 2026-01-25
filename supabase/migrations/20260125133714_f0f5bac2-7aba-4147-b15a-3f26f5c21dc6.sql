-- Add new columns for featured products functionality
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS old_price numeric;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS rating numeric;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS reviews_count integer DEFAULT 0;

-- Add index for faster featured products queries
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured) WHERE is_featured = true;