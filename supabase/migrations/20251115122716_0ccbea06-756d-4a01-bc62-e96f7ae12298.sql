-- Add size_variants column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS size_variants JSONB;

-- Create index on size_variants for better performance
CREATE INDEX IF NOT EXISTS idx_products_size_variants ON public.products USING GIN (size_variants);

-- Add comment to explain the structure
COMMENT ON COLUMN public.products.size_variants IS 'Array of objects with volume and price: [{"volume": "0,7 л", "price": 35.00}]';