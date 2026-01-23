

# Plan: Hero Carousel with Admin Management

## Overview

This plan redesigns the Hero section from a static text block to a full-screen carousel slider with images, overlay content, and complete admin panel management.

---

## Database Schema

### New Table: `hero_banners`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | Primary key |
| image_url | text | No | - | Banner background image URL |
| title | text | No | - | Main heading text |
| subtitle | text | Yes | null | Secondary text below title |
| button_text | text | Yes | null | CTA button label |
| button_link | text | Yes | null | CTA button destination URL |
| is_active | boolean | No | true | Toggle banner visibility |
| display_order | integer | No | 0 | Sort order (ascending) |
| created_at | timestamptz | No | now() | Creation timestamp |
| updated_at | timestamptz | No | now() | Last update timestamp |

### RLS Policies
- **SELECT**: Everyone can view active banners (`is_active = true`)
- **SELECT**: Admins can view all banners
- **INSERT/UPDATE/DELETE**: Admins only

---

## Component Architecture

```text
src/
  components/
    Hero.tsx                  [MODIFY] - Full carousel implementation
    admin/
      BannerManagement.tsx    [CREATE] - Admin CRUD for banners
  pages/
    Admin.tsx                 [MODIFY] - Add "Banners" tab
```

---

## Technical Implementation

### 1. Hero Component Redesign

**Visual Structure:**
- Full-width section with 75vh height (visible below fixed header)
- Margin-top for header offset (64px)
- Each slide: background image + dark gradient overlay + centered text content

**Carousel Features:**
- Autoplay every 5 seconds using `embla-carousel-autoplay` plugin
- Pause autoplay on mouse hover
- Smooth fade/slide transition
- Navigation arrows positioned bottom-right
- Dot indicators for current slide (optional)

**Content Overlay:**
- Semi-transparent black gradient from bottom
- Title: large bold white text with text-shadow
- Subtitle: medium white text
- CTA Button: using existing brand primary color

**Data Fetching:**
- Query `hero_banners` table where `is_active = true`
- Order by `display_order` ascending
- Fallback to static content if no banners exist

### 2. Banner Management Component

**Features:**
- Table view of all banners (similar to NewsManagement)
- Add/Edit dialog with form fields:
  - Image upload with preview
  - Title input
  - Subtitle input
  - Button text input
  - Button link input
  - Active toggle checkbox
- Drag or arrow buttons for reordering
- Delete with confirmation dialog
- Toggle active/inactive status quickly

**Image Upload:**
- Reuse existing pattern from BrandManagement/NewsManagement
- Upload to `product-images` bucket in `banners/` folder
- Show preview after selection

### 3. Admin Panel Integration

- Add new tab "Баннеры" (Banners) in Admin.tsx tabs list
- Import and render BannerManagement component

---

## Dependency

**New package required:**
- `embla-carousel-autoplay` - Autoplay plugin for Embla Carousel

---

## Implementation Steps

1. **Database migration** - Create `hero_banners` table with RLS policies
2. **Install autoplay plugin** - Add `embla-carousel-autoplay` package
3. **Create BannerManagement.tsx** - Admin component for banner CRUD
4. **Update Admin.tsx** - Add Banners tab
5. **Rewrite Hero.tsx** - Implement carousel with data fetching

---

## Visual Example

```text
+------------------------------------------------------------------+
|                    [Header - fixed, z-50]                        |
+------------------------------------------------------------------+
|                                                                   |
|    +---------------------------------------------------------+   |
|    |                                                         |   |
|    |          [Background Image - full width]                |   |
|    |                                                         |   |
|    |                                                         |   |
|    |                      TITLE TEXT                         |   |
|    |                    Subtitle text                        |   |
|    |                  [  CTA Button  ]                       |   |
|    |                                                         |   |
|    |                                         [<] [>]         |   |
|    +---------------------------------------------------------+   |
|                           o  o  o                                |
+------------------------------------------------------------------+
```

---

## Technical Details

### Carousel Configuration

```typescript
// Autoplay configuration
Autoplay({
  delay: 5000,
  stopOnInteraction: false,
  stopOnMouseEnter: true,
  playOnInit: true
})

// Embla options
{
  loop: true,
  align: 'start'
}
```

### Text Readability Strategy

- Dark gradient overlay on images: `bg-gradient-to-t from-black/70 via-black/30 to-transparent`
- Text shadows for titles: `text-shadow: 0 2px 4px rgba(0,0,0,0.5)`
- White text color for contrast

### Fallback Behavior

If no active banners exist, display default static content similar to current Hero to prevent empty section.

