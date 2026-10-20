// Заказ с сайта уходит в чат заказов один раз; без сети.
import assert from "node:assert";
process.env.TELEGRAM_BOT_TOKEN = "TEST";
const sent = [];
let taken = false;
const order = {
  id: "3f2a9c1e-1111-4222-8333-444455556666", name: "Али <b>", phone: "90 000 00 00", email: null,
  address: "Душанбе, Сино", notes: "после 18:00", total: 1530,
  items: [{ name: "Эмаль ПФ-115", qty: 3, price: 410, size: "2.7 кг" }, { name: "Кисть", qty: 1, price: 300, size: null }],
};
global.fetch = async (url, o) => {
  const body = JSON.parse(o.body);
  if (url.includes("/rest/v1/rpc/")) {
    const fn = url.split("/").pop();
    let out = null;
    if (fn === "bot_setting_get") out = { chat_id: 777 };
    if (fn === "bot_site_order_take" && body.p_order_id === order.id && !taken) { taken = true; out = order; }
    return { ok: true, text: async () => (out === null ? "" : JSON.stringify(out)) };
  }
  sent.push(body);
  return { json: async () => ({ ok: true }) };
};
const { default: handler } = await import("../../api/site-order.js");
const call = async (body) => {
  let out;
  await handler({ method: "POST", body }, { status(c) { out = { c }; return this; }, json(j) { out.j = j; }, end() {} });
  return out;
};
assert.equal((await call({ orderId: "nope" })).c, 400);
assert.deepEqual((await call({ orderId: order.id })).j, { sent: true });
assert.deepEqual((await call({ orderId: order.id })).j, { sent: false }, "второй раз не шлём");
assert.equal(sent.length, 1);
const m = sent[0];
assert.equal(m.chat_id, 777);
assert.match(m.text, /Новый заказ с сайта/);
assert.match(m.text, /Али &lt;b&gt;/);
assert.match(m.text, /Эмаль ПФ-115 \(2\.7 кг\)/);
assert.match(m.text, /Итого: 1\s530 сом\./);
assert.equal(m.reply_markup.inline_keyboard[0][0].url, "https://wa.me/992900000000");
console.log(m.text);
console.log("site-order ok");
