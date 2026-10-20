-- Язык клиента в Telegram-боте @afsonatj_bot: русский или таджикский.
-- Выбирается при первом /start и меняется кнопкой «🌐 Забон / Язык». Ключ и проверка те же, что у bot_*.

create table if not exists public.bot_users (
  chat_id bigint primary key,
  lang text not null check (lang in ('ru', 'tg')),
  updated_at timestamptz not null default now()
);

alter table public.bot_users enable row level security;
revoke all on public.bot_users from anon, authenticated;

-- null: клиент ещё не выбирал язык.
create or replace function public.bot_lang_get(p_key text, p_chat bigint) returns text
language plpgsql security definer set search_path = public as $$
begin
  perform public._bot_check(p_key);
  return (select lang from public.bot_users where chat_id = p_chat);
end $$;

create or replace function public.bot_lang_set(p_key text, p_chat bigint, p_lang text) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public._bot_check(p_key);
  insert into public.bot_users (chat_id, lang, updated_at) values (p_chat, p_lang, now())
  on conflict (chat_id) do update set lang = excluded.lang, updated_at = now();
end $$;

revoke all on function public.bot_lang_get(text, bigint), public.bot_lang_set(text, bigint, text) from public;
grant execute on function public.bot_lang_get(text, bigint), public.bot_lang_set(text, bigint, text) to anon;
