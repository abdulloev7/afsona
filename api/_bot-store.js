// Хранилище бота: корзины, заказы, настройки и язык клиента в Supabase
// (миграции 20261020010000_telegram_bot_cart.sql и 20261020210000_bot_user_lang.sql).
// Таблицы закрыты RLS, бот вызывает только RPC-функции с ключом, выведенным из токена бота.
import crypto from "node:crypto";

// Публичные адрес и ключ проекта Supabase сайта (те же, что в .env для фронтенда).
const SUPABASE_URL = "https://pbdmochmasoylofhasrk.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiZG1vY2htYXNveWxvZmhhc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNjA5MzIsImV4cCI6MjA3NDYzNjkzMn0.E6Cui94_fN8x_aV6JccT2DWLFjPKBbh6K4NAUY3J278";

const key = () =>
  crypto.createHash("sha256").update(`afsona-cart:${process.env.TELEGRAM_BOT_TOKEN}`).digest("hex");

async function rpc(fn, args) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ p_key: key(), ...args }),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`${fn}: ${r.status} ${text}`);
  return text ? JSON.parse(text) : null;
}

export const store = {
  getCart: async (chat) => (await rpc("bot_cart_get", { p_chat: chat })) || [],
  setCart: (chat, items) => rpc("bot_cart_set", { p_chat: chat, p_items: items }),
  createOrder: (chat, customer) => rpc("bot_order_create", { p_chat: chat, p_customer: customer }),
  getSetting: (name) => rpc("bot_setting_get", { p_name: name }),
  setSetting: (name, value) => rpc("bot_setting_set", { p_name: name, p_value: value }),
  getLang: (chat) => rpc("bot_lang_get", { p_chat: chat }),
  setLang: (chat, lang) => rpc("bot_lang_set", { p_chat: chat, p_lang: lang }),
  takeSiteOrder: (orderId) => rpc("bot_site_order_take", { p_order_id: orderId }),
};
