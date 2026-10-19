// Webhook Telegram-бота @afsonatj_bot (адрес /api/telegram): каталог магазина «Афсона» без цен.
// Переменная окружения Vercel: TELEGRAM_BOT_TOKEN. Секрет webhook выводится из токена,
// поэтому отдельный секрет хранить не нужно (scripts/setup.mjs считает его так же).
import crypto from "node:crypto";
import catalog from "./_bot-catalog.js";

const WA_PHONE = "992927557919";
const IG_DM = "https://ig.me/m/afsona.build";
const IG = "https://instagram.com/afsona.build";
const TG_CHANNEL = "https://t.me/afsona_build";
const PER_PAGE = 8;

const cats = new Map(catalog.categories.map((c) => [c.id, c]));
const products = new Map();
for (const c of catalog.categories) for (const p of c.products) products.set(p.id, { ...p, cat: c.id });

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const wa = (text) => `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(text)}`;

const CONTACT_ROWS = [
  [{ text: "💬 Заказать в WhatsApp", url: wa("Здравствуйте! Пишу из Telegram-бота Афсоны.") }],
  [{ text: "📸 Написать в директ Instagram", url: IG_DM }],
];

const MAIN_TEXT =
  "Здравствуйте! Это бот магазина красок <b>«Афсона»</b> 🎨\n" +
  "Наши магазины работают в Душанбе и Худжанде.\n\n" +
  "Здесь можно посмотреть ассортимент и сразу написать нам: в WhatsApp или в директ Instagram.";

const mainKb = () => [
  [{ text: "🛍 Каталог", callback_data: "cats" }],
  [{ text: "📍 Адреса магазинов", callback_data: "addr" }],
  ...CONTACT_ROWS,
  [{ text: "📢 Наш Telegram-канал", url: TG_CHANNEL }],
];

const ADDR_TEXT =
  "📍 <b>Наши магазины</b>\n\n" +
  "<b>Душанбе</b>\n" +
  "Базар Кушониён, блок 7, вход между линиями 3 и 4, магазин 797\n" +
  "☎️ +992 906 66 70 60\n☎️ +992 501 79 52 79\n\n" +
  "<b>Худжанд</b>\n" +
  "Джумъа бозор\n" +
  "☎️ +992 92 755 7919\n\n" +
  "Наличие и цену уточняйте в WhatsApp или пишите в директ.";

const addrKb = () => [...CONTACT_ROWS, [{ text: "⬅️ В меню", callback_data: "m" }]];

const CATS_TEXT = "🛍 <b>Каталог «Афсона»</b>\nВыберите раздел:";
const catsKb = () => [
  ...catalog.categories.map((c) => [{ text: c.title, callback_data: `c:${c.id}:0` }]),
  [{ text: "⬅️ В меню", callback_data: "m" }],
];

function catView(cid, page) {
  const c = cats.get(cid);
  if (!c) return null;
  const pages = Math.ceil(c.products.length / PER_PAGE);
  page = Math.min(Math.max(0, page), pages - 1);
  const slice = c.products.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const kb = slice.map((p) => [{ text: p.title, callback_data: `p:${p.id}` }]);
  if (pages > 1) {
    const nav = [];
    if (page > 0) nav.push({ text: "◀️", callback_data: `c:${cid}:${page - 1}` });
    nav.push({ text: `${page + 1} / ${pages}`, callback_data: "noop" });
    if (page < pages - 1) nav.push({ text: "▶️", callback_data: `c:${cid}:${page + 1}` });
    kb.push(nav);
  }
  kb.push([{ text: "⬅️ Все разделы", callback_data: "cats" }]);
  return { text: `<b>${esc(c.title)}</b>\nВыберите товар:`, kb };
}

function productCaption(p) {
  const lines = [`<b>${esc(p.title)}</b>`];
  if (p.brand) lines.push(`Бренд: ${esc(p.brand)}`);
  lines.push("", esc(p.what));
  if (p.variants.length === 1) {
    lines.push("", `Фасовка: ${esc(p.variants[0])}`);
  } else {
    lines.push("", p.variants.length > 6 ? "Варианты:" : "Фасовка / варианты:");
    for (const v of p.variants) lines.push(`• ${esc(v)}`);
  }
  lines.push("", "Наличие и цену уточните в WhatsApp или напишите нам в директ.");
  return lines.join("\n");
}

const productKb = (p) => [
  [{ text: "💬 Заказать в WhatsApp", url: wa(`Здравствуйте! Интересует: ${p.title}`) }],
  [{ text: "📸 Написать в директ", url: IG_DM }],
  [{ text: "📍 Адреса магазинов", callback_data: "addr" }],
  [{ text: "⬅️ Назад к разделу", callback_data: `c:${p.cat}:0` }],
];

async function tg(method, body) {
  const r = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  if (!j.ok) console.error(method, j.description);
  return j;
}

const send = (chat_id, text, kb) =>
  tg("sendMessage", { chat_id, text, parse_mode: "HTML", disable_web_page_preview: true, reply_markup: { inline_keyboard: kb } });

// Текстовое сообщение меню редактируем на месте, под карточкой товара (фото) шлём новое.
async function show(msg, text, kb) {
  if (msg && !msg.photo) {
    const r = await tg("editMessageText", {
      chat_id: msg.chat.id, message_id: msg.message_id, text, parse_mode: "HTML",
      disable_web_page_preview: true, reply_markup: { inline_keyboard: kb },
    });
    if (r.ok || /not modified/.test(r.description || "")) return;
  }
  await send(msg.chat.id, text, kb);
}

async function onMessage(m) {
  if (m.chat.type !== "private") return;
  const t = (m.text || "").trim().toLowerCase();
  if (t.startsWith("/catalog") || t === "каталог") return send(m.chat.id, CATS_TEXT, catsKb());
  if (t.startsWith("/address") || t === "адреса") return send(m.chat.id, ADDR_TEXT, addrKb());
  if (t.startsWith("/start") || t.startsWith("/menu")) return send(m.chat.id, MAIN_TEXT, mainKb());
  return send(
    m.chat.id,
    "Я бот-каталог и пока не умею отвечать на вопросы 🙂\n" +
      "Напишите нам в WhatsApp или в директ Instagram, а ассортимент можно посмотреть в каталоге.",
    mainKb()
  );
}

async function onCallback(q, base) {
  const d = q.data || "";
  const msg = q.message;
  await tg("answerCallbackQuery", { callback_query_id: q.id });
  if (!msg) return;
  if (d === "m") return show(msg, MAIN_TEXT, mainKb());
  if (d === "cats") return show(msg, CATS_TEXT, catsKb());
  if (d === "addr") return show(msg, ADDR_TEXT, addrKb());
  if (d.startsWith("c:")) {
    const [, cid, page] = d.split(":");
    const v = catView(cid, Number(page) || 0);
    if (v) return show(msg, v.text, v.kb);
  }
  if (d.startsWith("p:")) {
    const p = products.get(d.slice(2));
    if (!p) return;
    const r = await tg("sendPhoto", {
      chat_id: msg.chat.id, photo: `${base}/bot/img/${p.img}`, caption: productCaption(p),
      parse_mode: "HTML", reply_markup: { inline_keyboard: productKb(p) },
    });
    if (!r.ok) await send(msg.chat.id, productCaption(p), productKb(p));
  }
}

async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).send("Afsona bot is running");
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const secret = token && crypto.createHash("sha256").update(`afsona-webhook:${token}`).digest("hex");
  if (!secret || req.headers["x-telegram-bot-api-secret-token"] !== secret) return res.status(401).end();
  const host = process.env.PUBLIC_HOST || req.headers["x-forwarded-host"] || req.headers.host;
  const base = `https://${host}`;
  const u = req.body || {};
  try {
    if (u.message) await onMessage(u.message);
    else if (u.callback_query) await onCallback(u.callback_query, base);
  } catch (e) {
    console.error(e);
  }
  // Всегда 200, иначе Telegram будет повторять апдейт.
  res.status(200).end();
}

export default handler;
export const _test = { catView, productCaption, products, catalog };
