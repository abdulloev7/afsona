-- Fix security issue: Enable RLS on categories table
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;