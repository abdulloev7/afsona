import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function transliterate(text: string): string {
  const ru = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклmnoprstufхцчшщъыьэюя';
  const en = 'ABVGDEEZhZIYKLMNOPRSTUFHCChShSchYYEYuYaabvgdeezzhziyiklmnoprstufhccshschyyeyuya';
  
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const index = ru.indexOf(char);
    result += index >= 0 ? en[index] : char;
  }
  
  return result
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatNewsDate(date: string): string {
  return format(new Date(date), 'd MMMM yyyy', { locale: ru });
}
