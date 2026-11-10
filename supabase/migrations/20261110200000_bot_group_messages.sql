-- Журнал рабочей СММ-группы «СММ - Афсона» (форум с темами): бот @afsonatj_bot — админ группы,
-- поэтому получает все её сообщения. Сохраняем их, чтобы СММ-ассистент мог читать вопросы и ответы
-- команды по темам. Пишет только бот (RPC с тем же ключом, что у bot_*), читать можно только из
-- панели Supabase / service role. Клиентов бота (личные чаты) не сохраняем.

create table if not exists public.bot_group_messages (
  chat_id bigint not null,
  message_id bigint not null,
  thread_id bigint,
  from_id bigint,
  from_name text,
  text text,
  topic_name text,
  sent_at timestamptz not null,
  raw jsonb not null,
  saved_at timestamptz not null default now(),
  primary key (chat_id, message_id)
);

create index if not exists bot_group_messages_thread_idx
  on public.bot_group_messages (chat_id, thread_id, sent_at);

alter table public.bot_group_messages enable row level security;
revoke all on public.bot_group_messages from anon, authenticated;

create or replace function public.bot_group_message_save(p_key text, p_msg jsonb) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public._bot_check(p_key);
  insert into public.bot_group_messages
    (chat_id, message_id, thread_id, from_id, from_name, text, topic_name, sent_at, raw)
  values (
    (p_msg->'chat'->>'id')::bigint,
    (p_msg->>'message_id')::bigint,
    (p_msg->>'message_thread_id')::bigint,
    (p_msg->'from'->>'id')::bigint,
    nullif(trim(concat_ws(' ', p_msg->'from'->>'first_name', p_msg->'from'->>'last_name')), ''),
    coalesce(p_msg->>'text', p_msg->>'caption'),
    coalesce(p_msg->'forum_topic_created'->>'name', p_msg->'forum_topic_edited'->>'name'),
    to_timestamp((p_msg->>'date')::bigint),
    p_msg
  )
  on conflict (chat_id, message_id) do nothing;
end $$;

revoke all on function public.bot_group_message_save(text, jsonb) from public;
grant execute on function public.bot_group_message_save(text, jsonb) to anon;
