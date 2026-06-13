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
      className="relative inline-flex h-10 w-20 items-center justify-between rounded-full border border-slate-200 bg-white px-2 text-slate-500 shadow-sm transition hover:border-red-100 hover:bg-red-50 theme-dark:border-slate-700 theme-dark:bg-slate-900 theme-dark:text-slate-300 theme-dark:hover:border-red-900/60 theme-dark:hover:bg-slate-800"
      onClick={() =>
        setTheme((currentTheme) => {
          const nextTheme = currentTheme === "dark" ? "light" : "dark";
          return nextTheme;
        })
      }
      role="switch"
      type="button"
    >
      <SunIcon />
      <MoonIcon />
      <span className={`absolute grid h-7 w-7 place-items-center rounded-full shadow-sm transition ${
        isDark
          ? "translate-x-9 bg-red-600 text-white"
          : "translate-x-0 bg-red-50 text-red-600"
      }`}
      >
        {isDark ? <MoonIcon /> : <SunIcon />}
      </span>
    </button>
  );
}

function SunIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 4V2M12 22v-2M4 12H2M22 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M18.4 5.6l1.4-1.4M4.2 19.8l1.4-1.4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path
        d="M20 14.5A7.8 7.8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}
