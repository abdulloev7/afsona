
# План: Исправление уникального ключа корзины для поддержки разных вариантов

## Обнаруженная проблема

В консоли появляется ошибка:
```
duplicate key value violates unique constraint "cart_items_user_id_product_id_key"
```

**Причина**: В таблице `cart_items` есть UNIQUE constraint `(user_id, product_id)`, который запрещает добавлять один и тот же товар более одного раза, даже если выбраны разные объемы/варианты.

---

## Решение

### 1. Миграция базы данных

Нужно удалить старый constraint и создать новый с учётом `selected_size`:

```sql
-- Drop the old unique constraint
ALTER TABLE cart_items 
DROP CONSTRAINT cart_items_user_id_product_id_key;

-- Create new unique constraint including selected_size
-- Using COALESCE to handle NULL values for products without sizes
CREATE UNIQUE INDEX cart_items_user_product_size_unique 
ON cart_items (user_id, product_id, COALESCE(selected_size, ''));
```

Это позволит:
- Добавлять товар "Радуга-210" с объёмом "1 кг" 
- Добавлять тот же товар с объёмом "5 кг" как отдельную строку
- Сохранить поведение для товаров без вариантов (один товар = одна запись)

---

### 2. Обновление логики CartContext.tsx

Текущая логика проверки дубликатов уже корректна:
```typescript
const existingItem = items.find(item => 
  item.product_id === productId && item.selected_size === selectedSize
);
```

Но нужно удостовериться, что при добавлении товара с `size_variants` всегда передаётся `selected_size`, иначе возникнет ситуация как сейчас (товар добавлен с `selected_size = null`).

---

### 3. Очистка некорректных данных

В БД уже есть записи с `selected_size = NULL` для товаров с вариантами. Их нужно удалить или исправить.

---

## Файлы для изменения

| Файл / Ресурс | Изменения |
|---------------|-----------|
| **Миграция SQL** | Удалить старый constraint, создать новый с `selected_size` |
| `src/contexts/CartContext.tsx` | Добавить валидацию: если у товара есть `size_variants`, требовать `selected_size` |

---

## Пошаговая реализация

### Шаг 1: Миграция базы данных

```sql
-- Remove old unique constraint that prevents multiple variants
ALTER TABLE cart_items 
DROP CONSTRAINT IF EXISTS cart_items_user_id_product_id_key;

-- Create new unique constraint that allows different sizes
CREATE UNIQUE INDEX IF NOT EXISTS cart_items_user_product_size_unique 
ON cart_items (user_id, product_id, COALESCE(selected_size, ''));

-- Clean up any cart items without selected_size for products that have variants
DELETE FROM cart_items 
WHERE selected_size IS NULL 
AND product_id IN (
  SELECT id FROM products WHERE size_variants IS NOT NULL AND jsonb_array_length(size_variants) > 0
);
```

### Шаг 2: Защита в CartContext.tsx

Добавить проверку в `addToCart`:

```typescript
const addToCart = async (productId: string, quantity: number = 1, selectedSize: string | null = null) => {
  // ... existing auth check ...
  
  // Fetch product to check if it requires size selection
  const { data: product } = await supabase
    .from('products')
    .select('size_variants')
    .eq('id', productId)
    .single();
  
  // Validate: if product has variants, size must be selected
  if (product?.size_variants && product.size_variants.length > 0 && !selectedSize) {
    toast({
      title: "Ошибка",
      description: "Пожалуйста, выберите объем товара",
      variant: "destructive",
    });
    return;
  }
  
  // ... rest of the function ...
};
```

---

## Ожидаемый результат

После исправлений:

1. Товары с разными вариантами можно добавлять в корзину как отдельные позиции
2. "Краска Радуга-210" с объёмом "1 кг" и "5 кг" будут двумя разными строками в корзине
3. Каждая строка показывает правильную цену для выбранного объёма
4. Невозможно добавить товар с вариантами без выбора конкретного объёма
