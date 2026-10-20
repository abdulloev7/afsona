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

Product labels: Хит = solid green, Советуем = dark green, Новинка = cream with a green outline, Акция = sale red, Эко = pale green with green text. Filters use green when active and white with a border when not.

Social and messenger icons use the brand green, not each network's own colors.

## Typography

- Body and UI: **Golos Text** 400–700 (Google Fonts). Made for Cyrillic.
- Headings h1–h6: **Commissioner** 600, letter-spacing −0.015em, `text-wrap: balance`.
- Paragraphs use `text-wrap: pretty` (set globally).
- No serif or italic display type. No text smaller than 12px for anything people need to read.

## Layout and components

- Cards: white, 1px border, small radius from `--radius`. Never a card inside a card.
- No eyebrow badges above headings ("Профессиональный сервис" and the like). The heading carries itself.
- No gradients on backgrounds, badges or text. No purple anywhere.
- No emoji as icons. Use lucide-react (or the existing tabler/react-icons) in the brand green.
- Colored left borders (`border-l-4`) are not used for callouts or quotes.
- Figures on the site must be true: counts come from the catalog, hours from the real schedule. No "100%", "24/7" or "1000+" tiles unless they are facts.

## Motion

framer-motion respects the OS "reduce motion" setting through `MotionConfig reducedMotion="user"` in `src/App.tsx`. Keep motion to short fades and slides; no bouncing or pulsing.

## Focus and selection

Global `:focus-visible` ring in the primary green, text selection tinted with the primary green (both in `src/index.css`).
