import { t } from "@/i18n";

// Supabase and the browser return errors in English. Show the customer our own text instead.
const KNOWN: [RegExp, string][] = [
  [/invalid login credentials/i, "Неверный email или пароль"],
  [/email not confirmed/i, "Email не подтверждён. Проверьте почту и перейдите по ссылке из письма"],
  [/user already registered|already been registered/i, "Пользователь с таким email уже зарегистрирован"],
  [/password should be at least/i, "Пароль должен содержать минимум 6 символов"],
  [/weak password|password is too weak/i, "Слишком простой пароль, придумайте сложнее"],
  [/unable to validate email|invalid email|email address .* is invalid/i, "Введите корректный email"],
  [/signups? not allowed|signup is disabled/i, "Регистрация сейчас недоступна"],
  [/rate limit|too many requests|for security purposes/i, "Слишком много попыток. Подождите минуту и попробуйте снова"],
  [/failed to fetch|network ?error|load failed/i, "Нет связи с сервером. Проверьте интернет и попробуйте снова"],
  [/jwt expired|session.*(missing|expired)|auth session missing/i, "Сессия истекла. Войдите снова"],
  [/duplicate key|unique constraint|already exists/i, "Запись с такими данными уже существует (например, такой же slug)"],
  [/row-level security|permission denied|not authorized/i, "Недостаточно прав для этого действия"],
  [/violates foreign key/i, "Эта запись связана с другими данными и не может быть изменена"],
  [/payload too large|exceeded the maximum allowed size|file size/i, "Файл слишком большой"],
];

export const errorMessage = (error: unknown, fallback = "Что-то пошло не так. Попробуйте ещё раз") => {
  const text = error instanceof Error ? error.message : typeof error === "object" && error && "message" in error ? String((error as { message: unknown }).message) : "";
  if (!text) return t(fallback);
  if (/[а-яё]/i.test(text)) return t(text);
  return t(KNOWN.find(([re]) => re.test(text))?.[1] ?? fallback);
};
