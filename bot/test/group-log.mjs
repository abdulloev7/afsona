// Сообщения СММ-группы сохраняются через RPC bot_group_message_save, бот в группе молчит.
import assert from "node:assert";
import crypto from "node:crypto";
process.env.TELEGRAM_BOT_TOKEN = "TEST";
const calls = [];
global.fetch = async (url, o) => {
  calls.push({ url, body: JSON.parse(o.body) });
  return { ok: true, text: async () => "", json: async () => ({ ok: true, result: {} }) };
};
const { default: handler } = await import("../../api/telegram.js");
const S = crypto.createHash("sha256").update("afsona-webhook:TEST").digest("hex");
const run = async (update) => {
  let status;
  const res = { status(s) { status = s; return this; }, end() {}, send() {} };
  await handler({ method: "POST", headers: { "x-telegram-bot-api-secret-token": S, host: "x" }, body: update }, res);
  return status;
};
const group = { id: -1003467096369, type: "supergroup", is_forum: true };
const m = { chat: group, message_id: 1771, message_thread_id: 30, date: 1794340500, from: { id: 7, first_name: "A" }, text: "База A есть" };
assert.equal(await run({ message: m }), 200);
assert.equal(calls.length, 1);
assert(calls[0].url.endsWith("/rpc/bot_group_message_save"));
assert.equal(calls[0].body.p_msg.message_thread_id, 30);
assert(!calls.some((c) => c.url.includes("api.telegram.org")), "в группе бот не отвечает");
// /start в группе тоже только сохраняется
calls.length = 0;
await run({ message: { ...m, message_id: 1772, text: "/start" } });
assert.equal(calls.length, 1);
// Ошибка базы не ломает webhook
global.fetch = async () => { throw new Error("db down"); };
const orig = console.error; console.error = () => {};
assert.equal(await run({ message: { ...m, message_id: 1773 } }), 200);
console.error = orig;
console.log("group-log ok");
