// Выбор языка и таджикская версия бота без сети: подменяем fetch для Bot API и Supabase RPC.
import assert from "node:assert";
import crypto from "node:crypto";
import fs from "node:fs";
process.env.TELEGRAM_BOT_TOKEN = "TEST";
const calls = [];
const db = { carts: {}, orders: [], langs: {}, settings: { orders_chat: { chat_id: 777 } } };
global.fetch = async (url, o) => {
  const body = JSON.parse(o.body);
  if (url.includes("/rest/v1/rpc/")) {
    const fn = url.split("/").pop();
    let out = null;
    if (fn === "bot_lang_get") out = db.langs[body.p_chat] || null;
    if (fn === "bot_lang_set") db.langs[body.p_chat] = body.p_lang;
    if (fn === "bot_cart_get") out = db.carts[body.p_chat] || [];
    if (fn === "bot_cart_set") db.carts[body.p_chat] = body.p_items;
    if (fn === "bot_setting_get") out = db.settings[body.p_name] || null;
    if (fn === "bot_order_create") {
      const items = db.carts[body.p_chat] || [];
      if (items.length) { db.orders.push({ customer: body.p_customer, items }); db.carts[body.p_chat] = []; out = { id: db.orders.length, items }; }
    }
    return { ok: true, text: async () => (out === null ? "" : JSON.stringify(out)) };
  }
  calls.push({ method: url.split("/").pop(), body });
  return { json: async () => ({ ok: true, result: {} }) };
};
const { default: handler, _test } = await import("../../api/telegram.js");
const { catalog, products, productCaption } = _test;
const TG = await import("../../api/_bot-tg.js");
const S = crypto.createHash("sha256").update("afsona-webhook:TEST").digest("hex");
const run = async (u) => handler({ method: "POST", headers: { "x-telegram-bot-api-secret-token": S, host: "x" }, body: u },
  { status() { return this; }, end() {}, send() {} });
const chat = { id: 1, type: "private" };
const from = { id: 1, first_name: "Али", username: "ali" };
const msg = { chat, message_id: 5 };
const cb = (data, m = msg) => run({ callback_query: { id: "q", data, message: m, from } });
const last = () => calls.at(-1).body;
const buttons = (b) => (b.reply_markup?.inline_keyboard || []).flat().map((x) => x.text);

// Все русские строки, которые бот переводит, есть в словаре.
const src = fs.readFileSync(new URL("../../api/telegram.js", import.meta.url), "utf8");
const keys = [...src.matchAll(/tr\(lang, "((?:[^"\\]|\\.)*)"/g)].map((m) => JSON.parse(`"${m[1]}"`));
const missing = keys.filter((k) => !(k in TG.UI));
assert.deepEqual(missing, [], "нет перевода");
for (const c of catalog.categories) {
  assert(TG.CATS[c.id], `раздел ${c.id}`);
  for (const p of c.products) assert(TG.PRODUCTS[p.id], `товар ${p.id}`);
}

// Первый /start: выбор языка, а не меню.
await run({ message: { chat, from, text: "/start" } });
assert.deepEqual(buttons(last()), ["🇷🇺 Русский", "🇹🇯 Тоҷикӣ"]);
await cb("lang:tg");
assert.equal(db.langs[1], "tg");
assert(last().text.startsWith("Ассалому алайкум"));
assert(buttons(last()).includes("🛒 Сабад") && buttons(last()).includes("🌐 Забон / Язык"));
// Повторный /start: сразу меню на выбранном языке.
await run({ message: { chat, from, text: "/start" } });
assert(last().text.startsWith("Ассалому алайкум"));
// Каталог, раздел, карточки по-таджикски.
await cb("cats");
assert(last().text.includes("Бахшро интихоб кунед") && buttons(last())[0] === "🎨 Рангҳо");
for (const c of catalog.categories) await cb(`c:${c.id}:0`);
for (const p of products.values()) {
  const cap = productCaption(p, "tg");
  assert(cap.length <= 1024, `подпись ${p.id} длиннее 1024`);
}
for (const c of calls) for (const b of (c.body.reply_markup?.inline_keyboard || []).flat())
  if (b.callback_data) assert(Buffer.byteLength(b.callback_data) <= 64);
await cb("p:r210", msg);
assert(last().caption.includes("Ранги шустушавандаи «Радуга-210»") && last().caption.includes("Бастабандӣ"));
// Заказ: клиенту по-таджикски, продавцу по-русски с пометкой о языке.
await cb("add:r210", { ...msg, photo: [{}] });
assert(buttons(last()).includes("🛒 Ба сабад гузаштан"));
await cb("av:r210:1", { ...msg, photo: [{}] });
assert(calls.at(-1).body.text.includes("Дар сабад: 1 дона"));
await cb("add:acryrub", { ...msg, photo: [{}] });
await cb("av:acryrub:3", { ...msg, photo: [{}] });
await cb("cart");
assert(last().text.includes("Сабади шумо") && last().text.includes("қаҳваранг"));
await cb("ord");
assert.equal(last().reply_markup.keyboard[1][0].text, "Бе рақам фиристодан");
await run({ message: { chat, from, text: "Бе рақам фиристодан" } });
assert.equal(db.orders.length, 1);
const inv = calls.find((c) => c.body.text?.startsWith("🧾"));
assert(inv.body.text.includes("Фармоиши №1") && inv.body.text.includes("Ранги шустушавандаи"));
assert(decodeURIComponent(inv.body.reply_markup.inline_keyboard[0][0].url).includes("Фармоиши №1"));
const toSeller = calls.find((c) => c.body.chat_id === 777);
assert(toSeller.body.text.includes("Новый заказ из бота") && toSeller.body.text.includes("Краска моющаяся «Радуга-210», 14 кг"));
assert(toSeller.body.text.includes("таджикский") && toSeller.body.text.includes("номер не указан"));
// Смена языка из меню и командой.
await cb("lang");
assert.deepEqual(buttons(last()), ["🇷🇺 Русский", "🇹🇯 Тоҷикӣ"]);
await cb("lang:ru");
assert(last().text.startsWith("Здравствуйте!"));
await run({ message: { chat, from, text: "/lang" } });
assert.deepEqual(buttons(last()), ["🇷🇺 Русский", "🇹🇯 Тоҷикӣ"]);
console.log("ok: выбор языка и таджикская версия");
console.log(inv.body.text); console.log("---"); console.log(toSeller.body.text);
console.log("---"); console.log(productCaption(products.get("kist"), "tg"));
