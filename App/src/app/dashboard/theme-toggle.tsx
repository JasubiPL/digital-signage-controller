"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

const STORAGE_KEY = "dashboard-theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "dark" || stored === "light") return stored;

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.remove("dark");
  document.documentElement.dataset.dashboardTheme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <button
      aria-checked={isDark}
      aria-label="Cambiar tema"
      className="relative inline-flex h-10 w-28 items-center rounded-full border border-slate-200 bg-white px-1.5 text-xs font-extrabold text-slate-600 shadow-sm transition hover:border-red-100 hover:bg-red-50 theme-dark:border-slate-700 theme-dark:bg-slate-900 theme-dark:text-slate-200 theme-dark:hover:border-red-900/60 theme-dark:hover:bg-slate-800"
      onClick={() =>
        setTheme((currentTheme) => {
          const nextTheme = currentTheme === "dark" ? "light" : "dark";
          return nextTheme;
        })
      }
      role="switch"
      type="button"
    >
      <span className="absolute right-3">{isDark ? "Dark" : "Light"}</span>
      <span className={`grid h-7 w-7 place-items-center rounded-full text-[11px] shadow-sm transition ${
        isDark
          ? "translate-x-[4.75rem] bg-red-600 text-white"
          : "translate-x-0 bg-red-50 text-red-600"
      }`}
      >
        {isDark ? "D" : "L"}
      </span>
    </button>
  );
}
