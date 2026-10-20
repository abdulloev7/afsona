// Копия заказа с сайта в Telegram-чат заказов бота (тот же, что назначен командой /orders_here).
// Корзина сайта (src/pages/Cart.tsx) шлёт сюда только номер заказа; всё остальное читается из базы,
// и каждый заказ отправляется не больше одного раза (функция bot_site_order_take).
import { store } from "./_bot-store.js";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const som = (n) => `${Number(n).toLocaleString("ru-RU")} сом.`;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function orderText(o) {
  const lines = [`🛒 <b>Новый заказ с сайта</b> №${esc(o.id.slice(0, 8))}`, ""];
  lines.push(`👤 ${esc(o.name)}`, `☎️ ${esc(o.phone)}`);
  if (o.email) lines.push(`✉️ ${esc(o.email)}`);
  lines.push(`📍 ${esc(o.address)}`);
  if (o.notes) lines.push(`💬 ${esc(o.notes)}`);
  lines.push("");
  o.items.forEach((it, i) => {
    const size = it.size ? ` (${esc(it.size)})` : "";
    lines.push(`${i + 1}. ${esc(it.name)}${size}\n    ${it.qty} × ${som(it.price)} = ${som(it.qty * it.price)}`);
  });
  lines.push("", `<b>Итого: ${som(o.total)}</b>`);
  return lines.join("\n");
}

// Номер клиента как ссылка WhatsApp; местные 9 цифр дополняем кодом Таджикистана.
const waLink = (phone) => {
  let d = String(phone).replace(/\D/g, "");
  if (d.length === 9) d = `992${d}`;
  return d.length >= 11 ? `https://wa.me/${d}` : null;
};

async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const orderId = req.body?.orderId;
  if (typeof orderId !== "string" || !UUID.test(orderId)) return res.status(400).json({ error: "Invalid orderId" });
  try {
    const dest = await store.getSetting("orders_chat");
    if (!dest?.chat_id) return res.status(200).json({ sent: false, reason: "orders chat not set" });
    const order = await store.takeSiteOrder(orderId);
    if (!order) return res.status(200).json({ sent: false });
    const wa = waLink(order.phone);
    const r = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: dest.chat_id,
        text: orderText(order),
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_markup: { inline_keyboard: wa ? [[{ text: "💬 Написать клиенту в WhatsApp", url: wa }]] : [] },
      }),
    });
    const j = await r.json().catch(() => ({}));
    if (!j.ok) console.error("sendMessage", j.description);
    return res.status(200).json({ sent: !!j.ok });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "notify failed" });
  }
}

export default handler;
