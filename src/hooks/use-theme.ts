import { useEffect, useState } from "react";
import { readStoredValue, writeStoredValue } from "../utils/storage";

type Theme = "light" | "dark";
const STORAGE_KEY = "theme";

export default function useThemeInternal() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";

    const stored = readStoredValue(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    writeStoredValue(STORAGE_KEY, theme);
  }, [theme]);

  return { theme, setTheme, isDark: theme === "dark" };
}
