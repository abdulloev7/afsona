// Webhook Telegram-бота @afsonatj_bot (адрес /api/telegram): каталог магазина «Афсона» без цен.
// Переменная окружения Vercel: TELEGRAM_BOT_TOKEN. Секрет webhook выводится из токена,
// поэтому отдельный секрет хранить не нужно (scripts/setup.mjs считает его так же).
import crypto from "node:crypto";
import catalog from "./_bot-catalog.js";
import { store } from "./_bot-store.js";
import * as TG from "./_bot-tg.js";

const WA_PHONE = "992927557919";
const IG_DM = "https://ig.me/m/afsona.build";
const IG = "https://instagram.com/afsona.build";
const TG_CHANNEL = "https://t.me/afsona_build";
const PER_PAGE = 8;
const OWNER_ID = 550505252; // владелец: только он может назначить чат для заказов (/orders_here)
const MAX_QTY = 999;

// Язык клиента: "ru" или "tg". Выбирается при первом /start, хранится в bot_users.
// Перевод в _bot-tg.js, ключ — русский текст; заказы продавцам всегда по-русски.
const tr = (lang, ru, vars) => {
  const text = (lang === "tg" && TG.UI[ru]) || ru;
  return vars ? text.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : text;
};
const LANG_TEXT = "🌐 Забонро интихоб кунед\nВыберите язык";
const langKb = () => [[{ text: "🇷🇺 Русский", callback_data: "lang:ru" }, { text: "🇹🇯 Тоҷикӣ", callback_data: "lang:tg" }]];

const variantWords = [...TG.VARIANT_WORDS].sort((a, b) => b[0].length - a[0].length);
const variantRe = new RegExp(variantWords.map(([ru]) => ru.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "g");
const variantMap = new Map(variantWords);
const variantTg = (v) => v.replace(variantRe, (m) => variantMap.get(m));

const cats = new Map(catalog.categories.map((c) => [c.id, c]));
const products = new Map();
for (const c of catalog.categories) {
  for (const p of c.products) {
    const [title, what] = TG.PRODUCTS[p.id] || [p.title, p.what];
    products.set(p.id, { ...p, cat: c.id, tg: { title, what, variants: p.variants.map(variantTg) } });
  }
}
const catTitle = (c, lang) => (lang === "tg" && TG.CATS[c.id]) || c.title;
// Название, описание и фасовки товара на языке клиента.
const loc = (p, lang) => (lang === "tg" ? p.tg : p);

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const wa = (text) => `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(text)}`;

const contactRows = (lang) => [
  [{ text: tr(lang, "💬 Заказать в WhatsApp"), url: wa(tr(lang, "Здравствуйте! Пишу из Telegram-бота Афсоны.")) }],
  [{ text: tr(lang, "📸 Написать в директ Instagram"), url: IG_DM }],
];

const MAIN_RU =
  "Здравствуйте! Это бот магазина красок <b>«Афсона»</b> 🎨\n" +
  "Наши магазины работают в Душанбе и Худжанде.\n\n" +
  "Здесь можно посмотреть ассортимент, собрать заказ в корзину и отправить его нам.";

const mainText = (lang) => tr(lang, MAIN_RU);

const mainKb = (lang) => [
  [{ text: tr(lang, "🛍 Каталог"), callback_data: "cats" }, { text: tr(lang, "🛒 Корзина"), callback_data: "cart" }],
  [{ text: tr(lang, "📍 Адреса магазинов"), callback_data: "addr" }],
  ...contactRows(lang),
  [{ text: tr(lang, "📢 Наш Telegram-канал"), url: TG_CHANNEL }],
  [{ text: "🌐 Забон / Язык", callback_data: "lang" }],
];

const addrText = (lang) =>
  tr(lang, "📍 <b>Наши магазины</b>") + "\n\n" +
  `<b>${tr(lang, "Душанбе")}</b>\n` +
  tr(lang, "Базар Кушониён, блок 7, вход между линиями 3 и 4, магазин 797") + "\n" +
  "☎️ +992 906 66 70 60\n☎️ +992 501 79 52 79\n\n" +
  `<b>${tr(lang, "Худжанд")}</b>\n` +
  tr(lang, "Джумъа бозор") + "\n" +
  "☎️ +992 92 755 7919\n\n" +
  tr(lang, "Наличие и цену уточняйте в WhatsApp или пишите в директ.");

const addrKb = (lang) => [...contactRows(lang), [{ text: tr(lang, "⬅️ В меню"), callback_data: "m" }]];

const catsText = (lang) => tr(lang, "🛍 <b>Каталог «Афсона»</b>\nВыберите раздел:");
const catsKb = (lang) => [
  ...catalog.categories.map((c) => [{ text: catTitle(c, lang), callback_data: `c:${c.id}:0` }]),
  [{ text: tr(lang, "⬅️ В меню"), callback_data: "m" }],
];

function catView(cid, page, lang) {
  const c = cats.get(cid);
  if (!c) return null;
  const pages = Math.ceil(c.products.length / PER_PAGE);
  page = Math.min(Math.max(0, page), pages - 1);
  const slice = c.products.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const kb = slice.map((p) => [{ text: loc(products.get(p.id), lang).title, callback_data: `p:${p.id}` }]);
  if (pages > 1) {
    const nav = [];
    if (page > 0) nav.push({ text: "◀️", callback_data: `c:${cid}:${page - 1}` });
    nav.push({ text: `${page + 1} / ${pages}`, callback_data: "noop" });
    if (page < pages - 1) nav.push({ text: "▶️", callback_data: `c:${cid}:${page + 1}` });
    kb.push(nav);
  }
  kb.push([{ text: tr(lang, "⬅️ Все разделы"), callback_data: "cats" }]);
  return { text: `<b>${esc(catTitle(c, lang))}</b>\n${tr(lang, "Выберите товар:")}`, kb };
}

function productCaption(p, lang) {
  const l = loc(p, lang);
  const lines = [`<b>${esc(l.title)}</b>`];
  if (p.brand) lines.push(tr(lang, "Бренд: {brand}", { brand: esc(p.brand) }));
  lines.push("", esc(l.what));
  if (l.variants.length === 1) {
    lines.push("", tr(lang, "Фасовка: {v}", { v: esc(l.variants[0]) }));
  } else {
    lines.push("", tr(lang, l.variants.length > 6 ? "Варианты:" : "Фасовка / варианты:"));
    for (const v of l.variants) lines.push(`• ${esc(v)}`);
  }
  lines.push("", tr(lang, "Наличие и цену уточните в WhatsApp или напишите нам в директ."));
  return lines.join("\n");
}

const productKb = (p, lang) => [
  [{ text: tr(lang, "🛒 В корзину"), callback_data: `add:${p.id}` }, { text: tr(lang, "Корзина"), callback_data: "cart" }],
  [{ text: tr(lang, "💬 Заказать в WhatsApp"), url: wa(tr(lang, "Здравствуйте! Интересует: {title}", { title: loc(p, lang).title })) }],
  [{ text: tr(lang, "📸 Написать в директ"), url: IG_DM }],
  [{ text: tr(lang, "📍 Адреса магазинов"), callback_data: "addr" }],
  [{ text: tr(lang, "⬅️ Назад к разделу"), callback_data: `c:${p.cat}:0` }],
];

// Выбор фасовки прямо под карточкой товара: каждое нажатие добавляет 1 шт.
const variantKb = (p, lang) => [
  ...loc(p, lang).variants.map((v, i) => [{ text: `➕ ${v}`, callback_data: `av:${p.id}:${i}` }]),
  [{ text: tr(lang, "🛒 Перейти в корзину"), callback_data: "cart" }],
  [{ text: tr(lang, "⬅️ Назад"), callback_data: `pk:${p.id}` }],
];

// ---------- Корзина и заказ ----------

const itemLabel = (it, lang) => {
  const p = products.get(it.p);
  if (!p) return null;
  const l = loc(p, lang);
  const v = l.variants[it.v];
  return l.variants.length > 1 || v ? `${l.title}, ${v}` : l.title;
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

function cartView(items, lang) {
  if (!items.length) {
    return {
      text: tr(lang, "🛒 <b>Корзина пуста</b>\nОткройте каталог и нажмите «В корзину» в карточке товара."),
      kb: [[{ text: tr(lang, "🛍 Каталог"), callback_data: "cats" }], [{ text: tr(lang, "⬅️ В меню"), callback_data: "m" }]],
    };
  }
  const qty = (n) => tr(lang, "{n} шт.", { n });
  const lines = [tr(lang, "🛒 <b>Ваша корзина</b>"), ""];
  items.forEach((it, i) => lines.push(`${i + 1}. ${esc(itemLabel(it, lang))} — <b>${qty(it.q)}</b>`));
  lines.push("", tr(lang, "Кнопками ниже можно изменить количество."));
  const kb = items.map((it, i) => [
    { text: "➖", callback_data: `q:${i}:-1` },
    { text: `${i + 1}. ${qty(it.q)}`, callback_data: "noop" },
    { text: "➕", callback_data: `q:${i}:1` },
  ]);
  kb.push([{ text: tr(lang, "✅ Оформить заказ"), callback_data: "ord" }]);
  kb.push([{ text: tr(lang, "🛍 Добавить ещё"), callback_data: "cats" }, { text: tr(lang, "🗑 Очистить"), callback_data: "clr" }]);
  return { text: lines.join("\n"), kb };
}

const dushanbeTime = () =>
  new Date().toLocaleString("ru-RU", { timeZone: "Asia/Dushanbe", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

// Накладная клиенту на его языке; копия продавцу всегда на русском (lang не передаётся).
function invoiceText(order, when, lang) {
  const lines = [tr(lang, "🧾 <b>Заказ №{id}</b> от {when}", { id: order.id, when }), "<pre>"];
  order.items.forEach((it, i) => lines.push(esc(`${i + 1}. ${itemLabel(it, lang)}\n   × ${tr(lang, "{n} шт.", { n: it.q })}`)));
  lines.push("</pre>", tr(lang, "Цены в боте не указаны: наличие и стоимость уточните у продавца."));
  return lines.join("\n");
}

function invoiceWa(order, lang) {
  const lines = [tr(lang, "Здравствуйте! Заказ №{id} из Telegram-бота Афсоны:", { id: order.id })];
  order.items.forEach((it, i) => lines.push(`${i + 1}. ${itemLabel(it, lang)} × ${tr(lang, "{n} шт.", { n: it.q })}`));
  return lines.join("\n");
}

const contactKb = (lang) => ({
  keyboard: [[{ text: tr(lang, "📱 Отправить мой номер"), request_contact: true }], [{ text: tr(lang, "Отправить без номера") }]],
  resize_keyboard: true,
  one_time_keyboard: true,
});
// Кнопка «без номера» приходит обычным текстом, на любом из двух языков.
const NO_PHONE = new Set(["отправить без номера", TG.UI["Отправить без номера"].toLowerCase()]);

async function finishOrder(m, phone, lang) {
  const chat = m.chat.id;
  const customer = {
    name: [m.from?.first_name, m.from?.last_name].filter(Boolean).join(" "),
    username: m.from?.username || null,
    phone: phone || null,
  };
  const order = await store.createOrder(chat, customer);
  if (!order) {
    await tg("sendMessage", { chat_id: chat, text: tr(lang, "Корзина пуста, оформлять нечего."), reply_markup: { remove_keyboard: true } });
    return send(chat, mainText(lang), mainKb(lang));
  }
  order.items = validItems(order.items);
  const when = dushanbeTime();
  await tg("sendMessage", { chat_id: chat, text: tr(lang, "Спасибо! Заказ передан продавцу 👍"), reply_markup: { remove_keyboard: true } });
  await send(chat, invoiceText(order, when, lang), [
    [{ text: tr(lang, "💬 Отправить заказ в WhatsApp"), url: wa(invoiceWa(order, lang)) }],
    [{ text: tr(lang, "📸 Написать в директ"), url: IG_DM }],
    [{ text: tr(lang, "⬅️ В меню"), callback_data: "m" }],
  ]);
  const dest = await store.getSetting("orders_chat").catch(() => null);
  if (dest?.chat_id) {
    const who = [
      customer.name && esc(customer.name),
      customer.username && `@${esc(customer.username)}`,
      customer.phone ? `☎️ ${esc(customer.phone)}` : "номер не указан",
    ].filter(Boolean).join(" · ");
    const langNote = lang === "tg" ? "\n🇹🇯 Клиент выбрал таджикский язык" : "";
    const kb = customer.username ? [[{ text: "Написать клиенту", url: `https://t.me/${customer.username}` }]] : [];
    await send(dest.chat_id, `🆕 Новый заказ из бота\n👤 ${who}${langNote}\n\n${invoiceText(order, when)}`, kb);
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

// Язык клиента; при сбое базы — русский, чтобы бот не перестал отвечать.
const getLang = (chat) => store.getLang(chat).catch(() => "ru");

async function onMessage(m) {
  const t = (m.text || "").trim().toLowerCase();
  // Владелец пишет /orders_here в группе продавцов (или в личке), и заказы начинают приходить туда.
  if (t.startsWith("/orders_here") && m.from?.id === OWNER_ID) {
    await store.setSetting("orders_chat", { chat_id: m.chat.id, title: m.chat.title || "личка владельца" });
    return tg("sendMessage", { chat_id: m.chat.id, text: "Готово: заказы из бота будут приходить в этот чат." });
  }
  if (m.chat.type !== "private") return;
  const chat = m.chat.id;
  const saved = await getLang(chat);
  // Первый /start: сначала выбор языка, потом меню.
  if ((t.startsWith("/start") && !saved) || t.startsWith("/lang") || t === "язык" || t === "забон") {
    return send(chat, LANG_TEXT, langKb());
  }
  const lang = saved || "ru";
  if (m.contact) return finishOrder(m, m.contact.phone_number, lang);
  if (NO_PHONE.has(t)) return finishOrder(m, null, lang);
  if (t.startsWith("/cart") || t === "корзина" || t === "сабад") {
    const v = cartView(validItems(await store.getCart(chat)), lang);
    return send(chat, v.text, v.kb);
  }
  if (t.startsWith("/catalog") || t === "каталог") return send(chat, catsText(lang), catsKb(lang));
  if (t.startsWith("/address") || t === "адреса" || t === "суроғаҳо") return send(chat, addrText(lang), addrKb(lang));
  if (t.startsWith("/start") || t.startsWith("/menu")) return send(chat, mainText(lang), mainKb(lang));
  return send(
    chat,
    tr(lang, "Я бот-каталог и пока не умею отвечать на вопросы 🙂\nНапишите нам в WhatsApp или в директ Instagram, а ассортимент можно посмотреть в каталоге."),
    mainKb(lang)
  );
}

async function onCallback(q, base) {
  const d = q.data || "";
  const msg = q.message;
  if (!msg) return tg("answerCallbackQuery", { callback_query_id: q.id });
  const chat = msg.chat.id;
  if (d.startsWith("lang:")) {
    const lang = d.slice(5) === "tg" ? "tg" : "ru";
    await store.setLang(chat, lang).catch((e) => console.error(e));
    await tg("answerCallbackQuery", { callback_query_id: q.id, text: lang === "tg" ? "Забон: тоҷикӣ" : "Язык: русский" });
    return show(msg, mainText(lang), mainKb(lang));
  }
  const lang = (await getLang(chat)) || "ru";
  if (d.startsWith("add:") || d.startsWith("av:")) {
    const [, pid, vi] = d.split(":");
    const p = products.get(pid);
    if (!p) return tg("answerCallbackQuery", { callback_query_id: q.id });
    if (d.startsWith("add:") && p.variants.length > 1) {
      await tg("answerCallbackQuery", { callback_query_id: q.id, text: tr(lang, "Выберите фасовку") });
      return tg("editMessageReplyMarkup", { chat_id: chat, message_id: msg.message_id, reply_markup: { inline_keyboard: variantKb(p, lang) } });
    }
    const v = Number(vi) || 0;
    const items = await addToCart(chat, pid, v);
    const l = loc(p, lang);
    return tg("answerCallbackQuery", {
      callback_query_id: q.id,
      text: tr(lang, "✅ Добавлено: {name}\nВ корзине: {n} шт.", { name: l.variants[v] || l.title, n: totalQty(items) }),
    });
  }
  await tg("answerCallbackQuery", { callback_query_id: q.id });
  if (d === "lang") return show(msg, LANG_TEXT, langKb());
  if (d.startsWith("pk:")) {
    const p = products.get(d.slice(3));
    if (p) return tg("editMessageReplyMarkup", { chat_id: chat, message_id: msg.message_id, reply_markup: { inline_keyboard: productKb(p, lang) } });
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
    const v = cartView(items, lang);
    return show(msg, v.text, v.kb);
  }
  if (d === "ord") {
    const items = validItems(await store.getCart(chat));
    if (!items.length) return show(msg, cartView(items, lang).text, cartView(items, lang).kb);
    return tg("sendMessage", {
      chat_id: chat,
      text: tr(lang, "Оставьте номер телефона, чтобы продавец мог с вами связаться. Или отправьте заказ без номера."),
      reply_markup: contactKb(lang),
    });
  }
  if (d === "m") return show(msg, mainText(lang), mainKb(lang));
  if (d === "cats") return show(msg, catsText(lang), catsKb(lang));
  if (d === "addr") return show(msg, addrText(lang), addrKb(lang));
  if (d.startsWith("c:")) {
    const [, cid, page] = d.split(":");
    const v = catView(cid, Number(page) || 0, lang);
    if (v) return show(msg, v.text, v.kb);
  }
  if (d.startsWith("p:")) {
    const p = products.get(d.slice(2));
    if (!p) return;
    const r = await tg("sendPhoto", {
      chat_id: msg.chat.id, photo: `${base}/bot/img/${p.img}`, caption: productCaption(p, lang),
      parse_mode: "HTML", reply_markup: { inline_keyboard: productKb(p, lang) },
    });
    if (!r.ok) await send(msg.chat.id, productCaption(p, lang), productKb(p, lang));
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
export const _test = { catView, productCaption, products, catalog, cartView, invoiceText, invoiceWa, tr };
