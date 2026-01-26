

# План реализации страницы "Портфолио"

## Обзор

Создание раздела "Портфолио" для демонстрации объектов и проектов, выполненных с использованием продукции AFSONA. На первом этапе доступ только для администраторов, с возможностью управления через админ-панель.

---

## Структура данных

### Таблица `portfolio`

| Поле | Тип | Описание |
|------|-----|----------|
| id | uuid | Первичный ключ |
| title | text | Название проекта |
| slug | text | URL-friendly идентификатор |
| description | text | Краткое описание |
| content | text | Полный текст (Rich Text) |
| location | text | Местоположение объекта |
| completion_date | date | Дата завершения |
| image | text | Главное изображение |
| image_fit | text | Режим отображения (cover/contain) |
| media | jsonb | Галерея медиафайлов |
| products_used | uuid[] | Связанные товары (опционально) |
| published | boolean | Статус публикации |
| author_id | uuid | Автор записи |
| created_at | timestamp | Дата создания |
| updated_at | timestamp | Дата обновления |

### RLS-политики

- Админы: полный доступ (SELECT, INSERT, UPDATE, DELETE)
- Публичные пользователи: только SELECT при `published = true` (на будущее)

---

## Архитектура компонентов

```text
src/
├── pages/
│   ├── Portfolio.tsx           -- Список проектов (только для админов)
│   └── PortfolioDetail.tsx     -- Детальная страница проекта
│
├── components/
│   └── admin/
│       └── PortfolioManagement.tsx  -- Управление в админ-панели
```

---

## Этап 1: База данных

### Миграция

Создание таблицы `portfolio` с полями для хранения информации о проектах и RLS-политиками:

- Включение RLS
- Политика для админов на все операции (используя `has_role`)
- Политика для публичного просмотра опубликованных записей (изначально отключена)

---

## Этап 2: Обновление типов

### `src/integrations/supabase/types.ts`

Добавление интерфейсов Row, Insert, Update для таблицы `portfolio`.

---

## Этап 3: Компонент управления портфолио

### `src/components/admin/PortfolioManagement.tsx`

Функционал:
- Список всех проектов с сортировкой по дате
- Таблица: изображение, название, локация, дата, статус публикации
- Диалог создания/редактирования:
  - Заголовок + автоматическая генерация slug
  - Краткое описание
  - Rich Text редактор для полного контента
  - Загрузка главного изображения с выбором fit
  - Загрузка медиагалереи (переиспользование MediaUploader)
  - Местоположение объекта
  - Дата завершения
  - Чекбокс публикации
- Удаление с подтверждением
- Быстрое переключение статуса публикации

Компонент будет построен по аналогии с `NewsManagement.tsx`, используя те же UI-элементы и паттерны.

---

## Этап 4: Страница Portfolio.tsx

### Логика доступа

Проверка роли администратора через `useUserRole()`:
- Если не админ - редирект на главную с уведомлением
- Показ loader во время проверки

### UI

- Заголовок "Портфолио проектов"
- Сетка карточек проектов (3 колонки на десктопе)
- Каждая карточка:
  - Изображение
  - Название
  - Местоположение
  - Дата завершения
  - Кнопка "Подробнее"

---

## Этап 5: Страница PortfolioDetail.tsx

### Содержимое

- Breadcrumbs навигация
- Главное изображение
- Заголовок и метаданные (локация, дата)
- Rich Text контент
- Медиагалерея
- Кнопка возврата

### Защита доступа

Аналогичная проверка на роль админа.

---

## Этап 6: Интеграция

### `src/pages/Admin.tsx`

- Добавление новой вкладки "Портфолио" в TabsList
- Импорт PortfolioManagement
- Расширение grid-cols с 5 до 6

### `src/App.tsx`

- Добавление маршрутов:
  - `/portfolio` -> Portfolio
  - `/portfolio/:slug` -> PortfolioDetail

### `src/components/Header.tsx`

- Добавление ссылки "Портфолио" в навигацию (видна только для админов)

---

## Порядок реализации

1. Создание миграции БД для таблицы `portfolio`
2. Обновление types.ts
3. Создание PortfolioManagement.tsx
4. Создание Portfolio.tsx
5. Создание PortfolioDetail.tsx
6. Обновление Admin.tsx (новая вкладка)
7. Обновление App.tsx (маршруты)
8. Обновление Header.tsx (ссылка для админов)

---

## Техническая реализация

### Миграция SQL

```sql
CREATE TABLE public.portfolio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  content text NOT NULL,
  location text,
  completion_date date,
  image text,
  image_fit text DEFAULT 'cover',
  media jsonb DEFAULT '[]'::jsonb,
  products_used uuid[] DEFAULT '{}',
  published boolean NOT NULL DEFAULT false,
  author_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;

-- Админы могут просматривать все проекты
CREATE POLICY "Admins can view all portfolio" 
ON public.portfolio FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Админы могут создавать проекты
CREATE POLICY "Admins can insert portfolio" 
ON public.portfolio FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Админы могут обновлять проекты
CREATE POLICY "Admins can update portfolio" 
ON public.portfolio FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Админы могут удалять проекты
CREATE POLICY "Admins can delete portfolio" 
ON public.portfolio FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Триггер для автообновления updated_at
CREATE TRIGGER update_portfolio_updated_at
  BEFORE UPDATE ON public.portfolio
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Примечания

- Используется существующий bucket `product-images` для хранения изображений
- Переиспользуются компоненты: RichTextEditor, MediaUploader
- Паттерн защиты аналогичен Admin.tsx

