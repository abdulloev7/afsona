

# План улучшения корзины с мультиселектом

## Обзор задачи

Добавить возможность выбирать отдельные товары в корзине с помощью чекбоксов, чтобы пользователь мог:
- Выбирать определённые товары для заказа
- Выбирать/снимать выделение со всех товаров сразу
- Удалять только выбранные товары
- Видеть сумму только за выбранные товары
- Оформлять заказ только на выбранные товары

---

## Архитектура решения

```text
┌─────────────────────────────────────────────────────────────────┐
│                         Cart.tsx                                 │
├─────────────────────────────────────────────────────────────────┤
│  State:                                                          │
│  - selectedItems: Set<string>  (ID выбранных товаров)           │
│                                                                  │
│  Functions:                                                      │
│  - toggleItem(id)              - переключить выбор товара       │
│  - toggleAll()                 - выбрать/снять всё              │
│  - removeSelected()            - удалить выбранные              │
│  - getSelectedTotal()          - сумма за выбранные             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Header Panel                                              │  │
│  │  [✓] Выбрать все (3 из 5)    [🗑️ Удалить выбранные]      │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Cart Item Card                                            │  │
│  │  [✓]  [🖼️]  Название товара         [-] 2 [+]   [🗑️]     │  │
│  │              Объем: 5л                                     │  │
│  │              2 × 500 сом = 1000 сом                        │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Summary Card                                              │  │
│  │  Выбрано: 3 товара                                         │  │
│  │  Сумма: 2 500 сом                                          │  │
│  │                                                            │  │
│  │  [Оформить заказ (3 товара)]                               │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Изменения в файлах

### 1. `src/pages/Cart.tsx` - Основные изменения

#### 1.1 Новые состояния

```typescript
const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
```

#### 1.2 Новые функции

```typescript
// Переключить выбор товара
const toggleItem = (itemId: string) => {
  setSelectedItems(prev => {
    const next = new Set(prev);
    if (next.has(itemId)) {
      next.delete(itemId);
    } else {
      next.add(itemId);
    }
    return next;
  });
};

// Выбрать/снять все
const toggleAll = () => {
  if (selectedItems.size === items.length) {
    setSelectedItems(new Set());
  } else {
    setSelectedItems(new Set(items.map(item => item.id)));
  }
};

// Удалить выбранные
const removeSelected = async () => {
  for (const itemId of selectedItems) {
    await removeFromCart(itemId);
  }
  setSelectedItems(new Set());
};

// Сумма за выбранные товары
const getSelectedTotal = () => {
  return items
    .filter(item => selectedItems.has(item.id))
    .reduce((total, item) => {
      let itemPrice = item.product.price;
      if (item.product.size_variants && item.selected_size) {
        const variant = item.product.size_variants.find(v => v.volume === item.selected_size);
        if (variant) itemPrice = variant.price;
      }
      return total + (itemPrice * item.quantity);
    }, 0);
};
```

#### 1.3 Выбор всех при загрузке

```typescript
// При первой загрузке выбрать все товары
useEffect(() => {
  if (items.length > 0 && selectedItems.size === 0) {
    setSelectedItems(new Set(items.map(item => item.id)));
  }
}, [items]);
```

#### 1.4 Новая панель управления выбором

Добавить перед списком товаров:

```tsx
<div className="flex items-center justify-between p-4 bg-card rounded-lg border mb-4">
  <div className="flex items-center gap-3">
    <Checkbox
      checked={selectedItems.size === items.length && items.length > 0}
      onCheckedChange={toggleAll}
      id="select-all"
    />
    <Label htmlFor="select-all" className="cursor-pointer">
      Выбрать все ({selectedItems.size} из {items.length})
    </Label>
  </div>
  
  {selectedItems.size > 0 && (
    <Button
      variant="outline"
      size="sm"
      onClick={removeSelected}
      className="text-destructive hover:text-destructive"
    >
      <Trash2 className="h-4 w-4 mr-2" />
      Удалить выбранные ({selectedItems.size})
    </Button>
  )}
</div>
```

#### 1.5 Чекбокс в каждой карточке товара

Добавить чекбокс в начало каждой карточки:

```tsx
<Card key={item.id} className={cn(
  "transition-colors",
  selectedItems.has(item.id) && "ring-2 ring-primary/20"
)}>
  <CardContent className="p-4">
    <div className="flex items-center gap-4">
      <Checkbox
        checked={selectedItems.has(item.id)}
        onCheckedChange={() => toggleItem(item.id)}
      />
      {/* остальной контент карточки */}
    </div>
  </CardContent>
</Card>
```

#### 1.6 Обновлённый блок итого

```tsx
<Card>
  <CardHeader>
    <CardTitle>Итого</CardTitle>
  </CardHeader>
  <CardContent className="space-y-3">
    <div className="flex justify-between text-sm text-muted-foreground">
      <span>Товаров в корзине:</span>
      <span>{items.length}</span>
    </div>
    <div className="flex justify-between text-sm text-muted-foreground">
      <span>Выбрано для заказа:</span>
      <span>{selectedItems.size}</span>
    </div>
    <Separator />
    <div className="flex justify-between text-2xl font-bold">
      <span>Сумма:</span>
      <span>{getSelectedTotal().toLocaleString('ru-RU')} сом.</span>
    </div>
  </CardContent>
</Card>
```

#### 1.7 Обновлённая логика оформления заказа

Изменить `handleSubmitOrder` чтобы оформлять только выбранные товары:

```typescript
const handleSubmitOrder = async (e: React.FormEvent) => {
  // ...
  
  const selectedItemsList = items.filter(item => selectedItems.has(item.id));
  
  if (selectedItemsList.length === 0) {
    toast({
      title: "Ничего не выбрано",
      description: "Выберите хотя бы один товар для оформления заказа",
      variant: "destructive",
    });
    return;
  }

  // Использовать selectedItemsList вместо items для создания заказа
  const total = getSelectedTotal();
  
  // ... создание заказа с selectedItemsList
  
  // После успеха — удалить из корзины только заказанные товары
  for (const item of selectedItemsList) {
    await removeFromCart(item.id);
  }
  setSelectedItems(new Set());
};
```

#### 1.8 Кнопка оформления заказа с подсказкой

```tsx
<Button 
  type="submit" 
  className="w-full" 
  disabled={loading || selectedItems.size === 0}
>
  {loading 
    ? 'Оформляем заказ...' 
    : `Оформить заказ (${selectedItems.size} товаров)`
  }
</Button>
```

---

## Дополнительные улучшения

### Новые импорты

```typescript
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
```

### Индикация "частично выбрано"

Если выбраны не все товары, показывать индетерминированное состояние чекбокса "Выбрать все":

```tsx
<Checkbox
  checked={selectedItems.size === items.length}
  ref={(el) => {
    if (el) {
      (el as any).indeterminate = 
        selectedItems.size > 0 && selectedItems.size < items.length;
    }
  }}
  onCheckedChange={toggleAll}
/>
```

---

## Визуальный результат

1. **Панель "Выбрать все"** — вверху списка с чекбоксом и кнопкой удаления
2. **Чекбокс в каждой карточке** — слева от изображения товара
3. **Выделение выбранных** — легкая подсветка рамкой выбранных карточек
4. **Динамическая сумма** — пересчёт суммы только за выбранные товары
5. **Кнопка заказа** — показывает количество выбранных товаров, неактивна если ничего не выбрано
6. **Удаление выбранных** — одной кнопкой удалить все отмеченные товары

