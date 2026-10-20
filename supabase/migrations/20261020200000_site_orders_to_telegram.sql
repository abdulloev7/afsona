-- Заказы с сайта дублируются в Telegram-чат заказов бота (api/site-order.js).
-- Бот забирает заказ один раз и только свежий, с тем же ключом, что и остальные функции bot_*.

alter table public.orders add column if not exists telegram_notified_at timestamptz;

create or replace function public.bot_site_order_take(p_key text, p_order_id uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v jsonb;
begin
  perform public._bot_check(p_key);
  update public.orders set telegram_notified_at = now()
   where id = p_order_id and telegram_notified_at is null and created_at > now() - interval '15 minutes';
  if not found then
    return null;
  end if;
  select jsonb_build_object(
    'id', o.id, 'name', o.customer_name, 'phone', o.customer_phone, 'email', o.customer_email,
    'address', o.delivery_address, 'notes', o.notes, 'total', o.total_amount,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object('name', coalesce(p.name, 'Товар'), 'qty', i.quantity, 'price', i.price,
                                          'size', i.selected_size) order by i.created_at)
        from public.order_items i left join public.products p on p.id = i.product_id
       where i.order_id = o.id), '[]'::jsonb))
  into v from public.orders o where o.id = p_order_id;
  return v;
end $$;

revoke all on function public.bot_site_order_take(text, uuid) from public;
grant execute on function public.bot_site_order_take(text, uuid) to anon;
