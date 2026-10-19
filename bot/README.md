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
