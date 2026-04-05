"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-9 items-center gap-2 rounded-md border border-[#1a2744] bg-[#0d1421] px-3 text-xs font-semibold text-[#d1d5db] transition hover:text-white"
      aria-label="Toggle theme"
      title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
    >
      {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
      <span className="hidden sm:inline">{theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
}
