import { t } from "@/i18n";

export const SITE_URL = 'https://afsona.tj';
export const SITE_NAME = 'AFSONA';
export const DEFAULT_TITLE = t('AFSONA — эко краски и материалы для ремонта в Душанбе и Худжанде');
export const DEFAULT_DESCRIPTION = t(
  'Экологичные краски, грунтовки, штукатурки и инструменты для ремонта. Магазины в Душанбе и Худжанде, компьютерная колеровка, консультации специалистов.',
);
export const DEFAULT_IMAGE =
  'https://storage.googleapis.com/gpt-engineer-file-uploads/tdx3gONRWyXFDFtmzznIiU5lLPI2/social-images/social-1759066595227-Screenshot_1.jpg';

// Search results show roughly 160 characters of a description
export const toDescription = (text: string | null | undefined, fallback = DEFAULT_DESCRIPTION) => {
  const clean = (text || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[#*_>`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!clean) return fallback;
  if (clean.length <= 160) return clean;
  const cut = clean.slice(0, 157);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 100 ? cut.lastIndexOf(' ') : 157)}…`;
};
