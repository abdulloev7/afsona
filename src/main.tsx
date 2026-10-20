import { createRoot } from "react-dom/client";
import { z } from "zod";
import App from "./App.tsx";
import "./index.css";

// Default validation messages in Russian.
z.config(z.locales.ru());

createRoot(document.getElementById("root")!).render(<App />);
