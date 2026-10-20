import { createHash } from "node:crypto";
// Подключение и откат webhook. Токен и секрет только из окружения.
//   node bot/scripts/setup.mjs info
//   node bot/scripts/setup.mjs set https://www.afsona.tj
//   node bot/scripts/setup.mjs delete                       (откат: бот снова без webhook)
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) throw new Error("TELEGRAM_BOT_TOKEN не задан");
const secret = createHash("sha256").update(`afsona-webhook:${token}`).digest("hex");
const call = async (m, body = {}) => {
  const r = await fetch(`https://api.telegram.org/bot${token}/${m}`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
  });
  const j = await r.json();
  console.log(m, JSON.stringify(j.ok ? j.result : j.description));
  return j;
};
const [cmd, url] = process.argv.slice(2);
if (cmd === "info") await call("getWebhookInfo");
else if (cmd === "delete") await call("deleteWebhook");
else if (cmd === "set") {
  if (!url) throw new Error("нужен URL");
  await call("setWebhook", {
    url: `${url.replace(/\/$/, "")}/api/telegram`,
    secret_token: secret,
    allowed_updates: ["message", "callback_query"],
  });
  await call("setMyCommands", { commands: [
    { command: "start", description: "Главное меню" },
    { command: "catalog", description: "Каталог товаров" },
    { command: "address", description: "Адреса магазинов" },
    { command: "lang", description: "Язык / Забон" },
  ] });
  await call("setMyDescription", { description:
    "Бот магазина красок «Афсона» (Душанбе, Худжанд): каталог товаров, адреса и быстрый заказ в WhatsApp." });
  await call("setMyShortDescription", { short_description: "Каталог магазина красок «Афсона» и заказ в WhatsApp" });
  await call("getWebhookInfo");
} else console.log("команды: info | set <url> | delete");
