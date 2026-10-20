import { useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { lang, languageUrl, rememberLanguage, type Lang } from "@/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Drawn flags: emoji flags don't show on Windows.
const FlagRu = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 9 6" className={className} aria-hidden="true">
    <rect width="9" height="2" fill="#fff" />
    <rect y="2" width="9" height="2" fill="#0039A6" />
    <rect y="4" width="9" height="2" fill="#D52B1E" />
  </svg>
);

// Red, white (wider) and green stripes with the gold crown and seven stars, simplified for small sizes.
const FlagTj = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 140 70" className={className} aria-hidden="true">
    <rect width="140" height="20" fill="#CC0000" />
    <rect y="20" width="140" height="30" fill="#fff" />
    <rect y="50" width="140" height="20" fill="#006600" />
    <g fill="#F8C300">
      <path d="M62 41h16l2-8-5 4-5-7-5 7-5-4z" />
      {[-24, -16, -8, 0, 8, 16, 24].map((dx, i) => (
        <circle key={i} cx={70 + dx} cy={29 - Math.round(Math.sqrt(26 * 26 - dx * dx) / 3.2)} r="1.8" />
      ))}
    </g>
  </svg>
);

const LANGUAGES: { code: Lang; short: string; full: string; Flag: typeof FlagRu }[] = [
  { code: "ru", short: "Рус", full: "Русский", Flag: FlagRu },
  { code: "tg", short: "Тоҷ", full: "Тоҷикӣ", Flag: FlagTj },
];

const flagClass = "h-3.5 w-5 shrink-0 rounded-[2px] ring-1 ring-black/10";

// Plain links, so the other language is a real address (/catalog ↔ /tg/catalog).
// Switching reloads the page there and remembers the choice.
const languageLinkProps = (code: Lang) => ({
  href: languageUrl(code),
  hrefLang: code,
  lang: code,
  onClick: (e: React.MouseEvent) => {
    if (code === lang) {
      e.preventDefault();
      return;
    }
    rememberLanguage(code);
  },
});

const LanguageSwitcher = ({ variant = "compact", className }: { variant?: "compact" | "full"; className?: string }) => {
  useLocation(); // re-render on navigation so the links point at the current page
  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  if (variant === "full") {
    return (
      <div role="group" aria-label="Язык / Забон" className={cn("flex gap-2", className)}>
        {LANGUAGES.map(({ code, full, Flag }) => (
          <a
            key={code}
            {...languageLinkProps(code)}
            aria-current={code === lang ? "true" : undefined}
            className={cn(
              "flex h-10 flex-1 items-center justify-center gap-2 rounded-md border text-sm font-medium transition-colors",
              code === lang
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-foreground hover:border-primary/50",
            )}
          >
            <Flag className={flagClass} />
            {full}
          </a>
        ))}
      </div>
    );
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex h-10 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-foreground transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
        aria-label={`Язык / Забон: ${current.full}`}
      >
        <current.Flag className={flagClass} />
        <span>{current.short}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36">
        {LANGUAGES.map(({ code, full, Flag }) => (
          <DropdownMenuItem key={code} asChild className="gap-2.5 cursor-pointer">
            <a {...languageLinkProps(code)} aria-current={code === lang ? "true" : undefined}>
              <Flag className={flagClass} />
              <span className={cn(code === lang && "font-semibold text-primary")}>{full}</span>
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
