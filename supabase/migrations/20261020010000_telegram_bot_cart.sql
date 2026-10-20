-- Корзина и заказы Telegram-бота @afsonatj_bot (api/telegram.js).
-- Таблицы закрыты RLS без политик; бот работает только через функции ниже,
-- которые проверяют ключ, выведенный из токена бота (хранится лишь его sha256).

create table if not exists public.bot_carts (
  chat_id bigint primary key,
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.bot_orders (
  id bigserial primary key,
  chat_id bigint not null,
  customer jsonb not null default '{}'::jsonb,
  items jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.bot_settings (
  key text primary key,
  value jsonb not null
);

alter table public.bot_carts enable row level security;
alter table public.bot_orders enable row level security;
alter table public.bot_settings enable row level security;
revoke all on public.bot_carts, public.bot_orders, public.bot_settings from anon, authenticated;

create or replace function public._bot_check(p_key text) returns void
language plpgsql stable set search_path = public as $$
begin
  if p_key is null or encode(sha256(convert_to(p_key, 'UTF8')), 'hex') <> 'c228bf7e60effb7a2ecf6116dff5908661d613ba77ba7f2d15d0fc632c40026c' then
    raise exception 'forbidden';
  end if;
end $$;

create or replace function public.bot_cart_get(p_key text, p_chat bigint) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  perform public._bot_check(p_key);
  return coalesce((select items from public.bot_carts where chat_id = p_chat), '[]'::jsonb);
end $$;

create or replace function public.bot_cart_set(p_key text, p_chat bigint, p_items jsonb) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public._bot_check(p_key);
  insert into public.bot_carts (chat_id, items, updated_at) values (p_chat, p_items, now())
  on conflict (chat_id) do update set items = excluded.items, updated_at = now();
end $$;

-- Создаёт заказ из текущей корзины и очищает её. Возвращает номер заказа и позиции.
create or replace function public.bot_order_create(p_key text, p_chat bigint, p_customer jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_items jsonb; v_id bigint;
begin
  perform public._bot_check(p_key);
  select items into v_items from public.bot_carts where chat_id = p_chat for update;
  if v_items is null or jsonb_array_length(v_items) = 0 then
    return null;
  end if;
  insert into public.bot_orders (chat_id, customer, items) values (p_chat, coalesce(p_customer, '{}'::jsonb), v_items)
  returning id into v_id;
  update public.bot_carts set items = '[]'::jsonb, updated_at = now() where chat_id = p_chat;
  return jsonb_build_object('id', v_id, 'items', v_items);
end $$;

create or replace function public.bot_setting_get(p_key text, p_name text) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  perform public._bot_check(p_key);
  return (select value from public.bot_settings where key = p_name);
end $$;

create or replace function public.bot_setting_set(p_key text, p_name text, p_value jsonb) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public._bot_check(p_key);
  insert into public.bot_settings (key, value) values (p_name, p_value)
  on conflict (key) do update set value = excluded.value;
end $$;

revoke all on function public._bot_check(text) from public, anon, authenticated;
revoke all on function public.bot_cart_get(text, bigint), public.bot_cart_set(text, bigint, jsonb),
  public.bot_order_create(text, bigint, jsonb), public.bot_setting_get(text, text),
  public.bot_setting_set(text, text, jsonb) from public;
grant execute on function public.bot_cart_get(text, bigint), public.bot_cart_set(text, bigint, jsonb),
  public.bot_order_create(text, bigint, jsonb), public.bot_setting_get(text, text),
  public.bot_setting_set(text, text, jsonb) to anon;
