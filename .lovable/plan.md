
# План изменений в блоке "Лучшие предложения"

## Обзор задач

Необходимо внести 4 изменения:
1. Убрать отзывы (рейтинг/количество отзывов) из карточек и админки
2. Добавить выбор варианта товара при добавлении в корзину
3. Сделать карточки одинакового размера (симметричные)
4. Изменить фильтры тегов: цвет каждого тега + убрать число в скобках

---

## Этап 1: Изменения в FeaturedProductCard.tsx

### Убрать отзывы
Удалить блок с рейтингом и количеством отзывов (строки 94-104).

### Добавить выбор варианта товара
Добавить логику как в `ProductCard.tsx`:
- Импортировать `ProductSizeSelector` компонент
- Добавить состояние `showSizeSelector`
- При клике на "В корзину" проверять наличие вариантов
- Если есть варианты - открывать диалог выбора объема и количества
- Если нет вариантов - добавлять товар сразу

```typescript
// Добавить state
const [showSizeSelector, setShowSizeSelector] = useState(false);

// Проверка на наличие вариантов
const productHasVariants = product.size_variants && product.size_variants.length > 0;

// Логика добавления в корзину
const handleAddToCart = (e) => {
  e.preventDefault();
  e.stopPropagation();
  
  if (!user) {
    navigate('/auth');
    return;
  }
  
  if (productHasVariants) {
    setShowSizeSelector(true);
    return;
  }
  
  // Добавить товар без вариантов
  addToCart(product.id, 1, null);
};
```

### Сделать карточки одинаковой высоты
Добавить CSS классы для фиксированной высоты элементов:
- Контейнер карточки: `flex flex-col h-full`
- Блок с контентом: `flex-1 flex flex-col`
- Описание: фиксированная минимальная высота или убрать описание для унификации

---

## Этап 2: Изменения в FeaturedProducts.tsx

### Изменить фильтры тегов
Текущий код фильтров:
```tsx
<button className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
  selectedTag === tag
    ? 'bg-primary text-primary-foreground'
    : 'bg-muted text-muted-foreground hover:bg-muted/80'
}`}>
  {tag} ({count})  // <- убрать ({count})
</button>
```

Изменить на цветные кнопки без счетчика:
```tsx
const TAG_FILTER_STYLES = {
  'Хит': { active: 'bg-primary text-white', inactive: 'bg-primary/20 text-primary' },
  'Советуем': { active: 'bg-orange-500 text-white', inactive: 'bg-orange-100 text-orange-600' },
  'Новинка': { active: 'bg-purple-500 text-white', inactive: 'bg-purple-100 text-purple-600' },
  'Акция': { active: 'bg-yellow-400 text-yellow-900', inactive: 'bg-yellow-100 text-yellow-700' },
};

// Рендеринг кнопки
<button className={`... ${selectedTag === tag ? styles.active : styles.inactive}`}>
  {tag}  // без ({count})
</button>
```

---

## Этап 3: Изменения в ProductManagement.tsx (Админка)

### Убрать поля отзывов
Удалить из формы редактирования товара:
- Поле "Рейтинг (0-5)" (строки 688-702)
- Поле "Количество отзывов" (строки 703-714)

Удалить из интерфейса Product:
- `rating?: number | null`
- `reviews_count?: number | null`

Удалить из объекта по умолчанию:
- `rating: null`
- `reviews_count: null`

---

## Файлы для изменения

| Файл | Изменения |
|------|-----------|
| `src/components/FeaturedProductCard.tsx` | Убрать отзывы, добавить выбор вариантов, симметричные карточки |
| `src/components/FeaturedProducts.tsx` | Цветные фильтры без счетчиков |
| `src/components/admin/ProductManagement.tsx` | Убрать поля рейтинга и отзывов |

---

## Визуальный результат

### Карточки товаров
- Одинаковая высота всех карточек в ряду
- При клике "В корзину" открывается диалог выбора объема (если есть варианты)
- Без блока рейтинга и отзывов

### Фильтры тегов
- Кнопка "Все" - нейтральный цвет
- "Хит" - зеленый
- "Советуем" - оранжевый  
- "Новинка" - фиолетовый
- "Акция" - желтый
- Без цифр в скобках

