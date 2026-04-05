"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = localStorage.getItem("tradesphere-theme");
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
      return;
    }

    const preferred = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    setTheme(preferred);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem("tradesphere-theme", theme);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark")),
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
