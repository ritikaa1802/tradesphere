"use client";

import { useTheme } from "@/components/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      className="relative inline-flex h-8 w-[52px] items-center rounded-full px-1 transition-all duration-200"
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border)",
        color: "var(--text-secondary)",
        boxShadow: "var(--shadow-card)",
      }}
      aria-label="Toggle theme"
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      <span
        className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full transition-all duration-300"
        style={{
          left: isDark ? "calc(100% - 1.5rem - 0.25rem)" : "0.25rem",
          backgroundColor: "#ffffff",
        }}
        aria-hidden="true"
      />
    </button>
  );
}
