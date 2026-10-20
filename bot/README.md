# Telegram-бот @afsonatj_bot: каталог «Афсона»

Бот живёт в том же проекте Vercel, что и сайт: функция `api/telegram.js`, адрес `https://www.afsona.tj/api/telegram`.
Сайт она не затрагивает: Vercel отдаёт `/api/*` и статику из `public/` раньше SPA-переписывания из `vercel.json`.

- `api/telegram.js` — обработчик webhook: меню, каталог по разделам, карточки товаров, адреса магазинов. Без зависимостей.
- `api/_bot-catalog.js`, `public/bot/img/*.jpg` — генерируются `python3 bot/build/build.py` из `Afsona.xlsx` и фото
  (путь к папке ассортимента: переменная `AFSONA_SRC`). Цен нет нигде, описания только из названий в таблице.
- `node bot/test/smoke.mjs` — прогон всех кнопок без сети.
- `node bot/scripts/setup.mjs info | set https://www.afsona.tj | delete` — включить или откатить webhook.

## Настройка в Vercel

Одна переменная окружения проекта: `TELEGRAM_BOT_TOKEN` (Production). Секрет webhook вычисляется из токена
(`sha256("afsona-webhook:" + token)`), отдельно его хранить не нужно.

## Корзина и заказы

- Корзины, заказы и настройки хранятся в Supabase сайта: таблицы `bot_carts`, `bot_orders`, `bot_settings`
  (миграция `supabase/migrations/20261020010000_telegram_bot_cart.sql`). Таблицы закрыты RLS, бот вызывает только
  RPC-функции `bot_*` с ключом `sha256("afsona-cart:" + token)`; в базе лежит только sha256 этого ключа.
  При смене токена бота нужно обновить хэш в `public._bot_check`.
- Клиент получает накладную сообщением и кнопку «Отправить заказ в WhatsApp» с готовым списком.
- Копия заказа уходит в чат из настройки `orders_chat`. Владелец назначает его командой `/orders_here`
  в нужном чате (в личке бота или в группе продавцов, куда добавлен бот).
- `node bot/test/cart.mjs` — проверка корзины и заказа без сети.

## Заказы с сайта

- После оформления заказа на сайте корзина (`src/pages/Cart.tsx`) шлёт номер заказа в `api/site-order.js`,
  и бот присылает копию в тот же чат заказов (`orders_chat`). Новых переменных не нужно, хватает `TELEGRAM_BOT_TOKEN`.
- Заказ читается из базы функцией `bot_site_order_take` (миграция `20261020200000_site_orders_to_telegram.sql`):
  только свежий (до 15 минут) и только один раз, отметка в `orders.telegram_notified_at`.
- `node bot/test/site-order.mjs` — проверка без сети.
