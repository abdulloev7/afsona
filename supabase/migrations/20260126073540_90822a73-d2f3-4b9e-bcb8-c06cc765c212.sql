-- Создание таблицы portfolio для хранения проектов портфолио
CREATE TABLE public.portfolio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  content text NOT NULL,
  location text,
  completion_date date,
  image text,
  image_fit text DEFAULT 'cover',
  media jsonb DEFAULT '[]'::jsonb,
  products_used uuid[] DEFAULT '{}',
  published boolean NOT NULL DEFAULT false,
  author_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Включение Row Level Security
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;

-- Админы могут просматривать все проекты
CREATE POLICY "Admins can view all portfolio" 
ON public.portfolio FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Админы могут создавать проекты
CREATE POLICY "Admins can insert portfolio" 
ON public.portfolio FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Админы могут обновлять проекты
CREATE POLICY "Admins can update portfolio" 
ON public.portfolio FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Админы могут удалять проекты
CREATE POLICY "Admins can delete portfolio" 
ON public.portfolio FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Триггер для автообновления updated_at
CREATE TRIGGER update_portfolio_updated_at
  BEFORE UPDATE ON public.portfolio
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();