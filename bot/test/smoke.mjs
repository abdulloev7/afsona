// Прогон обработчика без сети: перехватываем fetch и печатаем вызовы Bot API.
process.env.TELEGRAM_BOT_TOKEN = "TEST";
const calls = [];
global.fetch = async (url, o) => {
  const body = JSON.parse(o.body);
  calls.push({ method: url.split("/").pop(), body });
  return { json: async () => ({ ok: true, result: {} }) };
};

const S = crypto.createHash("sha256").update("afsona-webhook:TEST").digest("hex");
const run = async (update, secret = S) => {
  let status;
  const res = { status(s) { status = s; return this; }, end() {}, send() {} };
  await handler({ method: "POST", headers: { "x-telegram-bot-api-secret-token": secret, "x-forwarded-host": "bot.example" }, body: update }, res);
  return status;
};
import assert from "node:assert";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const { default: handler, _test } = await import("../../api/telegram.js");
const { catalog, productCaption, products } = _test;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const chat = { id: 1, type: "private" };
const msg = { chat, message_id: 5 };
(async () => {
  assert.equal(await run({ message: { chat, text: "/start" } }, "wrong"), 401);
  assert.equal(calls.length, 0);
  await run({ message: { chat, text: "/start" } });
  await run({ message: { chat: { id: -100, type: "channel" }, text: "/start" } });
  await run({ callback_query: { id: "q", data: "cats", message: msg } });
  for (const c of catalog.categories) await run({ callback_query: { id: "q", data: `c:${c.id}:0`, message: msg } });
  await run({ callback_query: { id: "q", data: "c:tools:5", message: msg } });
  for (const p of products.keys()) await run({ callback_query: { id: "q", data: `p:${p}`, message: msg } });
  await run({ callback_query: { id: "q", data: "addr", message: { ...msg, photo: [{}] } } });
  // проверки
  const all = JSON.stringify(calls);
  assert(!/сомони|цена:|\d+,\d\d\s*(смн|сомони)/i.test(all), "в ответах не должно быть цен");
  for (const p of products.values()) assert(productCaption(p).length <= 1024, `подпись ${p.id} длиннее 1024`);
  for (const c of calls) for (const row of c.body.reply_markup?.inline_keyboard || [])
    for (const b of row) if (b.callback_data) assert(Buffer.byteLength(b.callback_data) <= 64);
  const photos = calls.filter((c) => c.method === "sendPhoto");
  assert.equal(photos.length, products.size);
  assert(photos.every((c) => c.body.photo.startsWith("https://bot.example/bot/img/")));
  assert.equal(calls.filter((c) => c.body.chat_id === -100).length, 0);
  for (const p of products.values()) assert(fs.existsSync(path.join(__dirname, "../../public/bot/img", p.img)), p.img);
  console.log(`ok: ${calls.length} вызовов Bot API, ${products.size} карточек`);
  console.log(productCaption(products.get("kist")));
  console.log(calls.find((c) => c.method === "sendMessage").body.text);
})().catch((e) => { console.error(e); process.exit(1); });
