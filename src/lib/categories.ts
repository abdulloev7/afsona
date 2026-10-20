import {
  Paintbrush, Palette, Blend, Droplet, Layers, SprayCan, Droplets, Brush, PaintRoller, Hammer,
  type LucideIcon,
} from "lucide-react";

// Display order of categories in the catalog and on the home page.
export const CATEGORY_ORDER: Record<string, number> = {
  'paints-and-coatings': 1,
  'decorative-coatings': 2,
  'tints-thinners': 3,
  'primers-preparatory': 4,
  'putties-leveling': 5,
  'adhesives-sealants': 6,
  'waterproofing': 7,
  'brushes-tools': 8,
  'rollers': 9,
  'spatulas-accessories': 10,
};

const CATEGORY_ROUTES: Record<string, string> = {
  'paints-and-coatings': '/paints-coatings',
  'adhesives-sealants': '/adhesives-sealants',
  'primers-preparatory': '/primers',
  'putties-leveling': '/putties-leveling',
  'decorative-coatings': '/decorative-coatings',
  'tints-thinners': '/tints-thinners',
  'waterproofing': '/waterproofing',
  'brushes-tools': '/brushes-tools',
  'rollers': '/rollers',
  'spatulas-accessories': '/spatulas-accessories',
};

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'paints-and-coatings': Paintbrush,
  'decorative-coatings': Palette,
  'tints-thinners': Blend,
  'primers-preparatory': Droplet,
  'putties-leveling': Layers,
  'adhesives-sealants': SprayCan,
  'waterproofing': Droplets,
  'brushes-tools': Brush,
  'rollers': PaintRoller,
  'spatulas-accessories': Hammer,
};

export const getCategoryLink = (slug: string) => CATEGORY_ROUTES[slug] || '/paints-coatings';

export const getCategoryIcon = (slug: string): LucideIcon => CATEGORY_ICONS[slug] || Paintbrush;

export const sortCategories = <T extends { slug: string }>(categories: T[]) =>
  [...categories].sort((a, b) => (CATEGORY_ORDER[a.slug] || 999) - (CATEGORY_ORDER[b.slug] || 999));

export const pluralizeProducts = (n: number) => {
  const mod10 = n % 10, mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'товар';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'товара';
  return 'товаров';
};
