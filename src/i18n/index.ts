import { tg } from "./tg";

// The site has two languages. Russian is the default and lives at the plain URLs
// (/catalog). Tajik lives under /tg (/tg/catalog). The language is read once from
// the address when the page loads; switching language reloads the page at the
// other address, so every module can use `t` directly.
export type Lang = "ru" | "tg";

export const TG_PREFIX = "/tg";
const STORAGE_KEY = "afsona-lang";

const isTajikPath = (path: string) => path === TG_PREFIX || path.startsWith(`${TG_PREFIX}/`);

export const lang: Lang =
  typeof window !== "undefined" && isTajikPath(window.location.pathname) ? "tg" : "ru";
export const isTajik = lang === "tg";

// react-router basename: links like "/catalog" become "/tg/catalog" automatically.
export const ROUTER_BASENAME = isTajik ? TG_PREFIX : undefined;

// Russian text is the key. A missing Tajik translation shows the Russian text.
// Placeholders: t("Корзина, товаров: {count}", { count: 3 }).
export const t = (ru: string, vars?: Record<string, string | number>) => {
  const text = (isTajik && tg[ru]) || ru;
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match));
};

// A site path ("/catalog") as it looks in the given language ("/tg/catalog").
export const pathFor = (target: Lang, path: string) => {
  if (target === "ru") return path;
  return path === "/" ? TG_PREFIX : `${TG_PREFIX}${path}`;
};

// The current page's path without the language prefix.
export const currentPath = () => {
  const path = window.location.pathname;
  if (!isTajikPath(path)) return path;
  return path.slice(TG_PREFIX.length) || "/";
};

export const languageUrl = (target: Lang) =>
  `${pathFor(target, currentPath())}${window.location.search}${window.location.hash}`;

export const rememberLanguage = (target: Lang) => {
  try {
    localStorage.setItem(STORAGE_KEY, target);
  } catch {
    // Private mode: the choice just isn't remembered
  }
};

// Someone who picked Tajik before and opens a Russian address is sent to the Tajik page.
// Only the visitor's own earlier choice counts; search engines never have one.
export const redirectToSavedLanguage = () => {
  if (isTajik) return false;
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch {
    return false;
  }
  if (saved !== "tg" || currentPath().startsWith("/admin")) return false;
  window.location.replace(languageUrl("tg"));
  return true;
};

// Database rows may have a Tajik copy of a field (name_tg next to name).
// Empty Tajik fields fall back to the Russian ones.
export const localized = <T extends object>(row: T | null | undefined, field: string): string => {
  if (!row) return "";
  const record = row as Record<string, unknown>;
  if (isTajik) {
    const value = record[`${field}_tg`];
    if (typeof value === "string" && value.trim()) return value;
  }
  const value = record[field];
  return typeof value === "string" ? value : "";
};

// Numbers keep the Russian grouping ("12 500") in both languages.
export const NUMBER_LOCALE = "ru-RU";

const TG_MONTHS = [
  "январи", "феврали", "марти", "апрели", "майи", "июни",
  "июли", "августи", "сентябри", "октябри", "ноябри", "декабри",
];
const ruDateFormat = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" });

// "20 октября 2026" / "20 октябри 2026"
export const formatLongDate = (value: string | Date) => {
  const date = new Date(value);
  if (isTajik) return `${date.getDate()} ${TG_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  return ruDateFormat.format(date).replace(/\s*г\.$/, "");
};

// "12 500 сом." / "12 500 сомонӣ"
export const formatPrice = (amount: number) => `${amount.toLocaleString(NUMBER_LOCALE)} ${t("сом.")}`;

const time = (date: Date) =>
  `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

// "20 октября 2026, 14:05"
export const formatDateTime = (value: string | Date) => `${formatLongDate(value)}, ${time(new Date(value))}`;

const TG_MONTHS_NOMINATIVE = [
  "январ", "феврал", "март", "апрел", "май", "июн",
  "июл", "август", "сентябр", "октябр", "ноябр", "декабр",
];
const ruMonthYearFormat = new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" });

// "октябрь 2026 г." / "октябр 2026"
export const formatMonthYear = (value: string | Date) => {
  const date = new Date(value);
  if (isTajik) return `${TG_MONTHS_NOMINATIVE[date.getMonth()]} ${date.getFullYear()}`;
  return ruMonthYearFormat.format(date);
};
