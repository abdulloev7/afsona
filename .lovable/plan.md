
# План исправления отправки заказа на почту

## Обзор задачи

Исправить edge function `send-order-notification` чтобы заказы снова отправлялись на почту магазина `afsonapaints@gmail.com` через Resend.

---

## Выявленные проблемы

1. **Устаревший метод аутентификации** — функция использует `getClaims(token)`, который не является стандартным методом Supabase JS SDK и может не работать. Нужно использовать `supabase.auth.getUser()`.

2. **BUSINESS_EMAIL** — необходимо убедиться, что в секретах установлен правильный email: `afsonapaints@gmail.com`

3. **Отсутствие логирования** — добавим больше логов для отладки

---

## Изменения в файлах

### 1. `supabase/functions/send-order-notification/index.ts`

#### 1.1 Исправить аутентификацию

Заменить нерабочий метод `getClaims()` на стандартный `getUser()`:

```typescript
// БЫЛО (строки 89-106):
const token = authHeader.replace('Bearer ', '');
const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);

if (claimsError || !claimsData?.claims) {
  return new Response(...);
}

const userId = claimsData.claims.sub;

// СТАНЕТ:
const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

if (userError || !user) {
  console.error("Authentication failed:", userError?.message);
  return new Response(
    JSON.stringify({ error: 'Unauthorized' }),
    { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

const userId = user.id;
```

#### 1.2 Улучшить логирование

Добавить логи для отладки:

```typescript
console.log("Starting send-order-notification function");
console.log("User authenticated:", userId);
console.log("BUSINESS_EMAIL configured:", !!Deno.env.get("BUSINESS_EMAIL"));
console.log("RESEND_API_KEY configured:", !!Deno.env.get("RESEND_API_KEY"));
```

#### 1.3 Добавить информацию о выбранном размере в email

Обновить шаблон email чтобы показывать объём товара:

```typescript
const orderItemsForEmail = selectedItemsList.map(item => ({
  product_name: item.product.name + (item.selected_size ? ` (${item.selected_size})` : ''),
  quantity: item.quantity,
  price: getItemPrice(item),
}));
```

---

### 2. Обновление секрета BUSINESS_EMAIL

Необходимо убедиться, что секрет `BUSINESS_EMAIL` содержит правильный адрес:

```
afsonapaints@gmail.com
```

---

## Итоговый код функции (ключевые изменения)

```typescript
const handler = async (req: Request): Promise<Response> => {
  console.log("send-order-notification: Starting request processing");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error("Missing or invalid Authorization header");
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Правильный способ проверки аутентификации
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      console.error("Authentication failed:", userError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userId = user.id;
    console.log("User authenticated successfully:", userId);
    
    // ... остальной код без изменений ...
  }
};
```

---

## Действия после реализации

1. **Обновить секрет BUSINESS_EMAIL** — установить значение `afsonapaints@gmail.com`
2. **Развернуть edge function** — автоматически после сохранения
3. **Проверить логи** — после тестового заказа посмотреть логи функции

---

## Важно про Resend

Убедитесь, что:
- API ключ Resend действителен (можно проверить на https://resend.com/api-keys)
- Если нужно отправлять с кастомного домена — домен должен быть верифицирован на https://resend.com/domains
- Пока домен не верифицирован, отправка работает только с `onboarding@resend.dev`
