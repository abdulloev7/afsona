-- Tajik copies of product and brand texts for the /tg version of the site.
-- Nullable: when empty, the Tajik site shows the Russian text, so nothing changes for existing rows.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS name_tg text,
  ADD COLUMN IF NOT EXISTS description_tg text;

ALTER TABLE public.brands
  ADD COLUMN IF NOT EXISTS description_tg text;
