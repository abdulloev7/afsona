// Корзина и заказ без сети: подменяем fetch для Bot API и Supabase RPC.
import assert from "node:assert";
import crypto from "node:crypto";
process.env.TELEGRAM_BOT_TOKEN = "TEST";
const calls = [];
const db = { carts: {}, orders: [], settings: { orders_chat: { chat_id: 777 } } };
global.fetch = async (url, o) => {
  const body = JSON.parse(o.body);
  if (url.includes("/rest/v1/rpc/")) {
    const fn = url.split("/").pop();
    let out = null;
    if (fn === "bot_cart_get") out = db.carts[body.p_chat] || [];
    if (fn === "bot_cart_set") db.carts[body.p_chat] = body.p_items;
    if (fn === "bot_setting_get") out = db.settings[body.p_name] || null;
    if (fn === "bot_setting_set") db.settings[body.p_name] = body.p_value;
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
const S = crypto.createHash("sha256").update("afsona-webhook:TEST").digest("hex");
const run = async (u) => handler({ method: "POST", headers: { "x-telegram-bot-api-secret-token": S, host: "x" }, body: u },
  { status() { return this; }, end() {}, send() {} });
const chat = { id: 1, type: "private" };
const from = { id: 1, first_name: "Али", username: "ali" };
const msg = { chat, message_id: 5, photo: [{}] };
const cb = (data) => run({ callback_query: { id: "q", data, message: msg, from } });

await cb("add:r129");                       // одна фасовка: сразу в корзину
await cb("add:r210");                       // несколько: показ выбора фасовки
assert.equal(calls.at(-1).method, "editMessageReplyMarkup");
await cb("av:r210:1"); await cb("av:r210:1"); await cb("av:r210:0");
assert.deepEqual(db.carts[1], [{ p: "r129", v: 0, q: 1 }, { p: "r210", v: 1, q: 2 }, { p: "r210", v: 0, q: 1 }]);
await cb("q:0:-1");                         // r129 убран
assert.equal(db.carts[1].length, 2);
await cb("cart");
assert(calls.at(-1).body.text.includes("14 кг — <b>2 шт.</b>"));
await cb("ord");
assert(calls.at(-1).body.reply_markup.keyboard[0][0].request_contact);
await run({ message: { chat, from, contact: { phone_number: "+992900000000" } } });
assert.equal(db.orders.length, 1);
assert.deepEqual(db.carts[1], []);
const inv = calls.find((c) => c.body.text?.startsWith("🧾"));
const toSeller = calls.find((c) => c.body.chat_id === 777);
assert(toSeller.body.text.includes("+992900000000") && toSeller.body.text.includes("@ali"));
const waBtn = inv.body.reply_markup.inline_keyboard[0][0].url;
assert(decodeURIComponent(waBtn).includes("Заказ №1"));
assert(!/сомони|смн/i.test(JSON.stringify(calls)));
// /orders_here: чужой не может переназначить
await run({ message: { chat: { id: -5, type: "group" }, from: { id: 2 }, text: "/orders_here" } });
assert.equal(db.settings.orders_chat.chat_id, 777);
await run({ message: { chat: { id: -5, type: "group", title: "g" }, from: { id: 550505252 }, text: "/orders_here" } });
assert.equal(db.settings.orders_chat.chat_id, -5);
await run({ message: { chat, from, text: "Отправить без номера" } }); // пустая корзина
console.log("ok: корзина и заказ");
console.log(inv.body.text); console.log("---"); console.log(toSeller.body.text);
