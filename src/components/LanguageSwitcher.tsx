import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { lang, languageUrl, rememberLanguage, type Lang } from "@/i18n";

const LANGUAGES: { code: Lang; short: string; full: string }[] = [
  { code: "ru", short: "Рус", full: "Русский" },
  { code: "tg", short: "Тоҷ", full: "Тоҷикӣ" },
];

// Plain links, so search engines can follow them to the other language too.
// Switching reloads the page at the other address (/catalog ↔ /tg/catalog).
const LanguageSwitcher = ({ variant = "compact", className }: { variant?: "compact" | "full"; className?: string }) => {
  useLocation(); // re-render on navigation so the links point at the current page

  return (
    <div
      role="group"
      aria-label="Язык / Забон"
      className={cn("flex items-center rounded-md border border-border p-0.5 text-sm", className)}
    >
      {LANGUAGES.map(({ code, short, full }) => {
        const active = code === lang;
        return (
          <a
            key={code}
            href={languageUrl(code)}
            hrefLang={code}
            lang={code}
            aria-current={active ? "true" : undefined}
            title={full}
            onClick={(e) => {
              if (active) {
                e.preventDefault();
                return;
              }
              rememberLanguage(code);
            }}
            className={cn(
              "flex items-center justify-center rounded px-2 font-medium transition-colors",
              variant === "full" ? "h-10 flex-1" : "h-8 min-w-10",
              active ? "bg-primary text-primary-foreground" : "text-foreground hover:text-primary",
            )}
          >
            {variant === "full" ? full : short}
          </a>
        );
      })}
    </div>
  );
};

export default LanguageSwitcher;
