// Webhook Telegram-бота @afsonatj_bot (адрес /api/telegram): каталог магазина «Афсона» без цен.
// Переменная окружения Vercel: TELEGRAM_BOT_TOKEN. Секрет webhook выводится из токена,
// поэтому отдельный секрет хранить не нужно (scripts/setup.mjs считает его так же).
import crypto from "node:crypto";
import catalog from "./_bot-catalog.js";
import { store } from "./_bot-store.js";

const WA_PHONE = "992927557919";
const IG_DM = "https://ig.me/m/afsona.build";
const IG = "https://instagram.com/afsona.build";
const TG_CHANNEL = "https://t.me/afsona_build";
const PER_PAGE = 8;
const OWNER_ID = 550505252; // владелец: только он может назначить чат для заказов (/orders_here)
const MAX_QTY = 999;

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
  "Здесь можно посмотреть ассортимент, собрать заказ в корзину и отправить его нам.";

const mainKb = () => [
  [{ text: "🛍 Каталог", callback_data: "cats" }, { text: "🛒 Корзина", callback_data: "cart" }],
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
  [{ text: "🛒 В корзину", callback_data: `add:${p.id}` }, { text: "Корзина", callback_data: "cart" }],
  [{ text: "💬 Заказать в WhatsApp", url: wa(`Здравствуйте! Интересует: ${p.title}`) }],
  [{ text: "📸 Написать в директ", url: IG_DM }],
  [{ text: "📍 Адреса магазинов", callback_data: "addr" }],
  [{ text: "⬅️ Назад к разделу", callback_data: `c:${p.cat}:0` }],
];

// Выбор фасовки прямо под карточкой товара: каждое нажатие добавляет 1 шт.
const variantKb = (p) => [
  ...p.variants.map((v, i) => [{ text: `➕ ${v}`, callback_data: `av:${p.id}:${i}` }]),
  [{ text: "🛒 Перейти в корзину", callback_data: "cart" }],
  [{ text: "⬅️ Назад", callback_data: `pk:${p.id}` }],
];

// ---------- Корзина и заказ ----------

const itemLabel = (it) => {
  const p = products.get(it.p);
  if (!p) return null;
  const v = p.variants[it.v];
  return p.variants.length > 1 || v ? `${p.title}, ${v}` : p.title;
};
const validItems = (items) => items.filter((it) => products.has(it.p) && products.get(it.p).variants[it.v] !== undefined);
const totalQty = (items) => items.reduce((n, it) => n + it.q, 0);

async function addToCart(chat, pid, vi) {
  const items = validItems(await store.getCart(chat));
  const it = items.find((x) => x.p === pid && x.v === vi);
  if (it) it.q = Math.min(MAX_QTY, it.q + 1);
  else items.push({ p: pid, v: vi, q: 1 });
  await store.setCart(chat, items);
  return items;
}

function cartView(items) {
  if (!items.length) {
    return {
      text: "🛒 <b>Корзина пуста</b>\nОткройте каталог и нажмите «В корзину» в карточке товара.",
      kb: [[{ text: "🛍 Каталог", callback_data: "cats" }], [{ text: "⬅️ В меню", callback_data: "m" }]],
    };
  }
  const lines = ["🛒 <b>Ваша корзина</b>", ""];
  items.forEach((it, i) => lines.push(`${i + 1}. ${esc(itemLabel(it))} — <b>${it.q} шт.</b>`));
  lines.push("", "Кнопками ниже можно изменить количество.");
  const kb = items.map((it, i) => [
    { text: "➖", callback_data: `q:${i}:-1` },
    { text: `${i + 1}. ${it.q} шт.`, callback_data: "noop" },
    { text: "➕", callback_data: `q:${i}:1` },
  ]);
  kb.push([{ text: "✅ Оформить заказ", callback_data: "ord" }]);
  kb.push([{ text: "🛍 Добавить ещё", callback_data: "cats" }, { text: "🗑 Очистить", callback_data: "clr" }]);
  return { text: lines.join("\n"), kb };
}

const dushanbeTime = () =>
  new Date().toLocaleString("ru-RU", { timeZone: "Asia/Dushanbe", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

function invoiceText(order, when) {
  const lines = [`🧾 <b>Заказ №${order.id}</b> от ${when}`, "<pre>"];
  order.items.forEach((it, i) => lines.push(esc(`${i + 1}. ${itemLabel(it)}\n   × ${it.q} шт.`)));
  lines.push("</pre>", "Цены в боте не указаны: наличие и стоимость уточните у продавца.");
  return lines.join("\n");
}

function invoiceWa(order) {
  const lines = [`Здравствуйте! Заказ №${order.id} из Telegram-бота Афсоны:`];
  order.items.forEach((it, i) => lines.push(`${i + 1}. ${itemLabel(it)} × ${it.q} шт.`));
  return lines.join("\n");
}

const CONTACT_KB = {
  keyboard: [[{ text: "📱 Отправить мой номер", request_contact: true }], [{ text: "Отправить без номера" }]],
  resize_keyboard: true,
  one_time_keyboard: true,
};

async function finishOrder(m, phone) {
  const chat = m.chat.id;
  const customer = {
    name: [m.from?.first_name, m.from?.last_name].filter(Boolean).join(" "),
    username: m.from?.username || null,
    phone: phone || null,
  };
  const order = await store.createOrder(chat, customer);
  if (!order) {
    await tg("sendMessage", { chat_id: chat, text: "Корзина пуста, оформлять нечего.", reply_markup: { remove_keyboard: true } });
    return send(chat, MAIN_TEXT, mainKb());
  }
  order.items = validItems(order.items);
  const when = dushanbeTime();
  await tg("sendMessage", { chat_id: chat, text: "Спасибо! Заказ передан продавцу 👍", reply_markup: { remove_keyboard: true } });
  await send(chat, invoiceText(order, when), [
    [{ text: "💬 Отправить заказ в WhatsApp", url: wa(invoiceWa(order)) }],
    [{ text: "📸 Написать в директ", url: IG_DM }],
    [{ text: "⬅️ В меню", callback_data: "m" }],
  ]);
  const dest = await store.getSetting("orders_chat").catch(() => null);
  if (dest?.chat_id) {
    const who = [
      customer.name && esc(customer.name),
      customer.username && `@${esc(customer.username)}`,
      customer.phone ? `☎️ ${esc(customer.phone)}` : "номер не указан",
    ].filter(Boolean).join(" · ");
    const kb = customer.username ? [[{ text: "Написать клиенту", url: `https://t.me/${customer.username}` }]] : [];
    await send(dest.chat_id, `🆕 Новый заказ из бота\n👤 ${who}\n\n${invoiceText(order, when)}`, kb);
  }
}

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
  const t = (m.text || "").trim().toLowerCase();
  // Владелец пишет /orders_here в группе продавцов (или в личке), и заказы начинают приходить туда.
  if (t.startsWith("/orders_here") && m.from?.id === OWNER_ID) {
    await store.setSetting("orders_chat", { chat_id: m.chat.id, title: m.chat.title || "личка владельца" });
    return tg("sendMessage", { chat_id: m.chat.id, text: "Готово: заказы из бота будут приходить в этот чат." });
  }
  if (m.chat.type !== "private") return;
  if (m.contact) return finishOrder(m, m.contact.phone_number);
  if (t === "отправить без номера") return finishOrder(m, null);
  if (t.startsWith("/cart") || t === "корзина") {
    const v = cartView(validItems(await store.getCart(m.chat.id)));
    return send(m.chat.id, v.text, v.kb);
  }
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
  if (!msg) return tg("answerCallbackQuery", { callback_query_id: q.id });
  const chat = msg.chat.id;
  if (d.startsWith("add:") || d.startsWith("av:")) {
    const [, pid, vi] = d.split(":");
    const p = products.get(pid);
    if (!p) return tg("answerCallbackQuery", { callback_query_id: q.id });
    if (d.startsWith("add:") && p.variants.length > 1) {
      await tg("answerCallbackQuery", { callback_query_id: q.id, text: "Выберите фасовку" });
      return tg("editMessageReplyMarkup", { chat_id: chat, message_id: msg.message_id, reply_markup: { inline_keyboard: variantKb(p) } });
    }
    const v = Number(vi) || 0;
    const items = await addToCart(chat, pid, v);
    return tg("answerCallbackQuery", {
      callback_query_id: q.id,
      text: `✅ Добавлено: ${p.variants[v] || p.title}\nВ корзине: ${totalQty(items)} шт.`,
    });
  }
  await tg("answerCallbackQuery", { callback_query_id: q.id });
  if (d.startsWith("pk:")) {
    const p = products.get(d.slice(3));
    if (p) return tg("editMessageReplyMarkup", { chat_id: chat, message_id: msg.message_id, reply_markup: { inline_keyboard: productKb(p) } });
  }
  if (d === "cart" || d === "clr" || d.startsWith("q:")) {
    let items = validItems(await store.getCart(chat));
    if (d === "clr") items = [];
    if (d.startsWith("q:")) {
      const [, i, delta] = d.split(":").map(Number);
      if (items[i]) items[i].q = Math.min(MAX_QTY, items[i].q + delta);
      items = items.filter((it) => it.q > 0);
    }
    if (d !== "cart") await store.setCart(chat, items);
    const v = cartView(items);
    return show(msg, v.text, v.kb);
  }
  if (d === "ord") {
    const items = validItems(await store.getCart(chat));
    if (!items.length) return show(msg, cartView(items).text, cartView(items).kb);
    return tg("sendMessage", {
      chat_id: chat,
      text: "Оставьте номер телефона, чтобы продавец мог с вами связаться. Или отправьте заказ без номера.",
      reply_markup: CONTACT_KB,
    });
  }
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
export const _test = { catView, productCaption, products, catalog, cartView, invoiceText, invoiceWa };
