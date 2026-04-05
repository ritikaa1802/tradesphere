"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold transition-all duration-200"
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border)",
        color: "var(--text-secondary)",
        boxShadow: "var(--shadow-card)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
        (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-hover)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
        (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-card)";
      }}
      aria-label="Toggle theme"
      title={isLight ? "Switch to dark theme" : "Switch to light theme"}
    >
      {isLight ? (
        <Moon size={14} style={{ color: "var(--color-purple)" }} />
      ) : (
        <Sun size={14} style={{ color: "#f59e0b" }} />
      )}
      <span className="hidden sm:inline">{isLight ? "Dark" : "Light"}</span>
    </button>
  );
}
