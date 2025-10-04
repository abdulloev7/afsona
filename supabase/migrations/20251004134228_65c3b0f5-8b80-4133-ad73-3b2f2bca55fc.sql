-- Align orders.status allowed values with the app UI
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders
ADD CONSTRAINT orders_status_check
CHECK (status IN (
  'pending',
  'processing',
  'completed',   -- added to match Admin UI
  'shipped',
  'delivered',
  'cancelled'
));