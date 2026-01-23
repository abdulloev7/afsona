
# План: Исправление работы корзины с мульти-вариантными товарами

## Обнаруженные проблемы

После анализа кода и базы данных выявлены следующие проблемы:

1. **Неправильная проверка при добавлении в корзину**: код проверяет `product.sizes?.length > 1`, но у многих товаров `sizes = null`, а варианты хранятся в `size_variants`

2. **Неверный расчёт итога корзины**: функция `getCartTotal()` использует `item.product.price` (устаревшую базовую цену), игнорируя цену выбранного варианта

3. **Товар добавляется без выбора объёма**: когда `sizes = null`, товар добавляется без открытия селектора объёмов, даже если есть `size_variants`

---

## План исправлений

### 1. Исправить ProductCard.tsx

**Проблема**: Условие показа селектора объёмов проверяет только `sizes`:
```typescript
if (product.sizes && product.sizes.length > 1) {
  setShowSizeSelector(true);
}
```

**Решение**: Добавить проверку `size_variants`:
```typescript
const hasMultipleVariants = 
  (product.size_variants && product.size_variants.length > 0) ||
  (product.sizes && product.sizes.length > 1);

if (hasMultipleVariants) {
  setShowSizeSelector(true);
}
```

Также исправить условие отображения кнопки (строки 222-249).

---

### 2. Исправить Product.tsx (страница товара)

**Проблема**: Аналогичная проверка `product.sizes.length > 1`

**Решение**: Использовать ту же логику с `hasMultipleVariants`:
```typescript
const hasMultipleVariants = 
  (product.size_variants && product.size_variants.length > 0) ||
  (product.sizes && product.sizes.length > 1);
```

Применить к `handleAddToCart()` и условиям отображения кнопок.

---

### 3. Исправить CartContext.tsx - getCartTotal()

**Проблема**: Расчёт итога игнорирует цены вариантов:
```typescript
const getCartTotal = () => {
  return items.reduce((total, item) => 
    total + (item.product.price * item.quantity), 0
  );
};
```

**Решение**: Использовать цену из `size_variants` если она есть:
```typescript
const getCartTotal = () => {
  return items.reduce((total, item) => {
    let itemPrice = item.product.price;
    if (item.product.size_variants && item.selected_size) {
      const variant = item.product.size_variants.find(
        v => v.volume === item.selected_size
      );
      if (variant) itemPrice = variant.price;
    }
    return total + (itemPrice * item.quantity);
  }, 0);
};
```

---

### 4. Дополнительная защита - обязательный выбор объёма

Для товаров с `size_variants` добавить валидацию: нельзя добавить в корзину без выбора конкретного объёма.

Если товар имеет варианты, но пользователь каким-то образом пытается добавить его без выбора — показать селектор принудительно.

---

## Файлы для изменения

| Файл | Изменения |
|------|-----------|
| `src/components/ProductCard.tsx` | Логика проверки вариантов, условия кнопок |
| `src/pages/Product.tsx` | Логика проверки вариантов, условия кнопок |
| `src/contexts/CartContext.tsx` | Расчёт `getCartTotal()` с учётом цен вариантов |

---

## Техническая реализация

### Вспомогательная функция (опционально)

Для DRY можно создать утилиту:
```typescript
// src/lib/product-utils.ts
export const hasMultipleVariants = (product: {
  sizes?: string[] | null;
  size_variants?: { volume: string; price: number }[] | null;
}) => {
  return (
    (product.size_variants && product.size_variants.length > 0) ||
    (product.sizes && product.sizes.length > 1)
  );
};

export const getVariantPrice = (
  product: { price: number; size_variants?: { volume: string; price: number }[] | null },
  selectedSize: string | null
) => {
  if (product.size_variants && selectedSize) {
    const variant = product.size_variants.find(v => v.volume === selectedSize);
    if (variant) return variant.price;
  }
  return product.price;
};
```

---

## Ожидаемый результат

После исправлений:

1. Для товаров с `size_variants` всегда открывается диалог выбора объёма
2. Каждый вариант добавляется как отдельная строка в корзине с правильной ценой
3. Итоговая сумма корзины рассчитывается по ценам выбранных вариантов
4. Можно добавить один и тот же товар с разными объёмами — они будут отображаться как разные позиции
