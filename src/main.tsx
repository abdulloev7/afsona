import { createRoot } from "react-dom/client";
import { z } from "zod";
import App from "./App.tsx";
import { isTajik, redirectToSavedLanguage } from "@/i18n";
import "./index.css";

// Default validation messages in Russian. Zod has no Tajik messages; our own forms pass their own text.
z.config(z.locales.ru());

document.documentElement.lang = isTajik ? "tg" : "ru";

if (!redirectToSavedLanguage()) {
  createRoot(document.getElementById("root")!).render(<App />);
}
