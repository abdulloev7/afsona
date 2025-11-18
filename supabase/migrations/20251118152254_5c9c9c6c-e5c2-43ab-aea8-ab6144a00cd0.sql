-- Create news table
CREATE TABLE public.news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  image TEXT,
  author_id UUID NOT NULL,
  published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT title_length CHECK (char_length(title) <= 200),
  CONSTRAINT excerpt_length CHECK (excerpt IS NULL OR char_length(excerpt) <= 300)
);

-- Enable Row Level Security
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- RLS Policies for news table
-- Everyone can view published news
CREATE POLICY "Published news are viewable by everyone"
ON public.news
FOR SELECT
USING (published = true);

-- Admins can view all news
CREATE POLICY "Admins can view all news"
ON public.news
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert news
CREATE POLICY "Admins can insert news"
ON public.news
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update news
CREATE POLICY "Admins can update news"
ON public.news
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete news
CREATE POLICY "Admins can delete news"
ON public.news
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic updated_at updates
CREATE TRIGGER update_news_updated_at
BEFORE UPDATE ON public.news
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for slug lookups
CREATE INDEX idx_news_slug ON public.news(slug);

-- Create index for published news
CREATE INDEX idx_news_published ON public.news(published, published_at DESC);