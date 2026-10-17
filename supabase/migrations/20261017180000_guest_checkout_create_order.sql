-- Guest checkout: orders can be placed without an account.
-- Prices and totals are computed here from the products table, never taken from the browser.

ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;

CREATE OR REPLACE FUNCTION public.create_order(
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_delivery_address text,
  p_notes text,
  p_items jsonb
)
RETURNS TABLE (order_id uuid, total_amount numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
  v_total numeric := 0;
  v_item jsonb;
  v_product record;
  v_price numeric;
  v_variant_price numeric;
  v_qty integer;
  v_size text;
BEGIN
  p_customer_name := btrim(coalesce(p_customer_name, ''));
  p_customer_phone := btrim(coalesce(p_customer_phone, ''));
  p_delivery_address := btrim(coalesce(p_delivery_address, ''));
  p_customer_email := nullif(btrim(coalesce(p_customer_email, '')), '');
  p_notes := nullif(btrim(coalesce(p_notes, '')), '');

  IF char_length(p_customer_name) NOT BETWEEN 1 AND 200 THEN
    RAISE EXCEPTION 'invalid customer_name';
  END IF;
  IF char_length(p_customer_phone) NOT BETWEEN 3 AND 50 THEN
    RAISE EXCEPTION 'invalid customer_phone';
  END IF;
  IF char_length(p_delivery_address) NOT BETWEEN 1 AND 500 THEN
    RAISE EXCEPTION 'invalid delivery_address';
  END IF;
  IF p_customer_email IS NOT NULL AND char_length(p_customer_email) > 255 THEN
    RAISE EXCEPTION 'invalid customer_email';
  END IF;
  IF p_notes IS NOT NULL AND char_length(p_notes) > 1000 THEN
    RAISE EXCEPTION 'invalid notes';
  END IF;
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array'
     OR jsonb_array_length(p_items) NOT BETWEEN 1 AND 100 THEN
    RAISE EXCEPTION 'invalid items';
  END IF;

  INSERT INTO public.orders (user_id, total_amount, customer_name, customer_phone,
                             customer_email, delivery_address, notes)
  VALUES (auth.uid(), 0, p_customer_name, p_customer_phone,
          p_customer_email, p_delivery_address, p_notes)
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_qty := (v_item->>'quantity')::integer;
    IF v_qty IS NULL OR v_qty < 1 OR v_qty > 1000 THEN
      RAISE EXCEPTION 'invalid quantity';
    END IF;
    v_size := nullif(v_item->>'selected_size', '');

    SELECT p.id, p.price, p.size_variants INTO v_product
    FROM public.products p
    WHERE p.id = (v_item->>'product_id')::uuid AND NOT p.archived;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'product not found';
    END IF;

    v_price := v_product.price;
    IF v_size IS NOT NULL AND jsonb_typeof(v_product.size_variants) = 'array' THEN
      SELECT (v->>'price')::numeric INTO v_variant_price
      FROM jsonb_array_elements(v_product.size_variants) v
      WHERE v->>'volume' = v_size
      LIMIT 1;
      IF v_variant_price IS NOT NULL THEN
        v_price := v_variant_price;
      END IF;
    END IF;

    INSERT INTO public.order_items (order_id, product_id, quantity, price, selected_size)
    VALUES (v_order_id, v_product.id, v_qty, v_price, v_size);

    v_total := v_total + v_price * v_qty;
  END LOOP;

  UPDATE public.orders SET total_amount = v_total WHERE id = v_order_id;

  RETURN QUERY SELECT v_order_id, v_total;
END;
$$;

REVOKE ALL ON FUNCTION public.create_order(text, text, text, text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_order(text, text, text, text, text, jsonb) TO anon, authenticated;
