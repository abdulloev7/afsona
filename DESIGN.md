# Design

Visual system for afsona.tj. Product context lives in PRODUCT.md. Lovable and any other agent should follow this file instead of their defaults.

## Direction

A local paint and finishing-materials shop, not a lifestyle brand. The site should feel like a well-kept store counter: calm brand colors, real products and prices up front, contact one tap away. Brand colors come from the logo (dark green + cream). Everything else stays out of the way so product photos and paint colors read true.

## Color

Tokens live in `src/index.css` (HSL, without `hsl()`), exposed through Tailwind (`bg-primary`, `text-muted-foreground`, …). Never hard-code Tailwind palette colors (`orange-500`, `purple-500`, `blue-500`) or hex values in components.

| Token | Value | Use |
| --- | --- | --- |
| `--background` | 50 100% 95% (cream, from the logo) | Page background. Kept on purpose: it is the brand cream, not a default. |
| `--card` | 0 0% 100% (white) | Cards, product tiles, forms. Products sit on white so their colors are not tinted by the cream. |
| `--foreground` | 155 45% 18% | Body text and headings |
| `--muted-foreground` | 155 18% 30% | Secondary text. At least 6:1 on cream and white. Do not go lighter. |
| `--primary` | 149 43% 28% (logo green) | Buttons, links, the "Хит" label, icon circles |
| `--brand-green-dark` | 151 48% 19% | "Советуем" label, pressed states |
| `--secondary` / `--muted` | 50 60% 91% / 50 50% 89% | Quiet panels and inputs on cream |
| `--sale` | 12 65% 40% | "Акция" only. The one warm accent outside the green family. |
| `--destructive` | 0 70% 42% | Errors and "Нет в наличии". White text on it passes 4.5:1. |

Product labels: Хит = solid green, Советуем = dark green, Новинка = cream with a green outline, Акция = sale red, Эко = pale green with green text. Filters use green when active and white with a border when not.

Social and messenger icons use the brand green, not each network's own colors.

## Typography

- Body and UI: **Golos Text** 400–700 (Google Fonts). Made for Cyrillic.
- Headings h1–h6: **Commissioner** 600, letter-spacing −0.015em, `text-wrap: balance`.
- Paragraphs use `text-wrap: pretty` (set globally).
- Heading levels never skip. A card right under the page h1 uses `<CardTitle as="h2">` (CardTitle defaults to h3).
- No serif or italic display type. No text smaller than 12px for anything people need to read.

## Layout and components

- Cards: white, 1px border, small radius from `--radius`. Never a card inside a card.
- No eyebrow badges above headings ("Профессиональный сервис" and the like). The heading carries itself.
- No gradients on backgrounds, badges or text. No purple anywhere.
- No emoji as icons. Use lucide-react (or the existing tabler/react-icons) in the brand green.
- Colored left borders (`border-l-4`) are not used for callouts or quotes.
- Figures on the site must be true: counts come from the catalog, hours from the real schedule. No "100%", "24/7" or "1000+" tiles unless they are facts.

## Motion

Motion is plain CSS (tailwindcss-animate classes such as `animate-in fade-in slide-in-from-bottom-5`); framer-motion is no longer loaded on shop pages. A global `prefers-reduced-motion` rule in `src/index.css` switches animations and transitions off for people who ask for less motion. Keep motion to short fades and slides; no bouncing or pulsing.

## Touch and labels

- Every tap target is at least 24×24 px; icon buttons use `size="icon"` (40 px). Small dots get a 24 px button around them.
- An icon-only button or link always has an `aria-label` in Russian.
- Don't wrap a `<Button>` in a `<Link>`; use `<Button asChild><Link …/></Button>`.

## Performance

- Only the home page is in the main bundle; every other route is `React.lazy` in `src/App.tsx`.
- Admin uploads go through `compressImage` (`src/lib/compressImage.ts`): WebP, at most 1600–2400 px wide. Supabase free plan has no image resizing, so the uploaded file is what shoppers download.

## Focus and selection

Global `:focus-visible` ring in the primary green, text selection tinted with the primary green (both in `src/index.css`).
