-- Create hero_banners table for carousel management
CREATE TABLE public.hero_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  button_text TEXT,
  button_link TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view active banners
CREATE POLICY "Active banners are viewable by everyone"
ON public.hero_banners
FOR SELECT
USING (is_active = true);

-- Policy: Admins can view all banners (including inactive)
CREATE POLICY "Admins can view all banners"
ON public.hero_banners
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy: Admins can insert banners
CREATE POLICY "Admins can insert banners"
ON public.hero_banners
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Policy: Admins can update banners
CREATE POLICY "Admins can update banners"
ON public.hero_banners
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policy: Admins can delete banners
CREATE POLICY "Admins can delete banners"
ON public.hero_banners
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_hero_banners_updated_at
BEFORE UPDATE ON public.hero_banners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();