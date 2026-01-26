

# План замены иконок в разделе "Колеровка"

## Обзор задачи

Заменить текущие иконки Lucide на более современные и профессиональные иконки из библиотеки Tabler Icons в секции "Колеровка" и "Почему выбирают нас".

---

## Текущее состояние

Сейчас используются иконки из `lucide-react`:
| Функция | Текущая иконка | Назначение |
|---------|----------------|------------|
| 2000+ оттенков | Palette | Выбор цветов |
| Компьютерная точность | MonitorCheck | Точность |
| Повторяемость | Repeat | Повтор результата |
| Быстрая колеровка | Clock | Время |
| Любой объём | Droplets | Объём краски |
| Консультации | Users | Эксперты |
| Точность попадания | Target | Точность |

---

## Предлагаемые новые иконки

Замена на иконки из `@tabler/icons-react` (уже установлен в проекте):

| Функция | Новая иконка | Обоснование |
|---------|--------------|-------------|
| 2000+ оттенков | `IconColorSwatch` | Современная иконка палитры цветов |
| Компьютерная точность | `IconDeviceDesktopAnalytics` | Компьютер с аналитикой — более профессионально |
| Повторяемость | `IconRefresh` | Чистая иконка обновления/повтора |
| Быстрая колеровка | `IconClock2` | Современные часы |
| Любой объём | `IconBucket` | Ведро краски — более релевантно |
| Консультации | `IconUserCheck` | Проверенный эксперт |
| Точность попадания | `IconFocusCentered` | Точное фокусирование на цели |

Дополнительно для кнопок Call-to-Action:
- Кнопка "Заказать колеровку": `IconPalette`
- Кнопка "Получить консультацию": `IconMessageChatbot`

---

## Изменения в файле

### `src/components/Tinting.tsx`

1. **Изменить импорты** — убрать Lucide, добавить Tabler Icons:
```tsx
// Было:
import { Palette, MonitorCheck, Clock, Repeat, Droplets, Users, Target } from "lucide-react";

// Станет:
import { 
  IconColorSwatch, 
  IconDeviceDesktopAnalytics, 
  IconRefresh, 
  IconClock2, 
  IconBucket, 
  IconUserCheck, 
  IconFocusCentered,
  IconPalette,
  IconMessageChatbot
} from "@tabler/icons-react";
```

2. **Обновить массив `advantages`** — заменить иконки:
```tsx
const advantages = [
  { icon: IconColorSwatch, title: "Более 2000 оттенков", ... },
  { icon: IconDeviceDesktopAnalytics, title: "Компьютерная точность", ... },
  { icon: IconRefresh, title: "Повторяемость результата", ... },
  { icon: IconClock2, title: "Быстрая колеровка", ... },
  { icon: IconBucket, title: "Любой объём", ... },
  { icon: IconUserCheck, title: "Профессиональные консультации", ... },
  { icon: IconFocusCentered, title: "Точность попадания", ... },
];
```

3. **Обновить карточку "Наше оборудование"** — заменить `MonitorCheck` на `IconDeviceDesktopAnalytics`

4. **Обновить кнопки CTA**:
   - "Заказать колеровку": `IconPalette`
   - "Получить консультацию": `IconMessageChatbot`

5. **Добавить `stroke={1.5}`** ко всем иконкам для единообразия стиля (как в Header)

---

## Визуальный результат

- Иконки станут более современными и соответствующими общему стилю сайта
- Единый стиль с Header (Tabler Icons, stroke: 1.5)
- Более релевантные иконки для каждой функции (например, ведро краски вместо капель)

