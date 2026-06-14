"use client";

import { useEffect, useState } from "react";

export function FeedbackToast({
  error,
  success,
}: Readonly<{
  error?: string;
  success?: string;
}>) {
  const message = error ?? success;
  const [expiredMessage, setExpiredMessage] = useState<string | null>(null);
  const isVisible = Boolean(message && expiredMessage !== message);

  useEffect(() => {
    if (!message) return;

    const timeout = window.setTimeout(() => {
      setExpiredMessage(message);
    }, 4000);

    return () => window.clearTimeout(timeout);
  }, [message]);

  if (!message) return null;

  const tone = error
    ? "border-red-200 bg-red-50 text-red-950 shadow-red-950/15 theme-dark:border-red-900/60 theme-dark:bg-red-950 theme-dark:text-red-100"
    : "border-emerald-200 bg-emerald-50 text-emerald-950 shadow-emerald-950/15 theme-dark:border-emerald-900/60 theme-dark:bg-emerald-950 theme-dark:text-emerald-100";
  const iconTone = error
    ? "bg-red-600 text-white theme-dark:bg-red-500"
    : "bg-emerald-600 text-white theme-dark:bg-emerald-500";

  return (
    <div
      aria-live="polite"
      className={`fixed left-1/2 top-6 z-[80] flex w-[min(92vw,38rem)] -translate-x-1/2 items-center gap-4 rounded-lg border px-7 py-5 text-base font-extrabold shadow-2xl transition-all duration-300 ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "-translate-y-4 pointer-events-none opacity-0"
      } ${tone}`}
      role={error ? "alert" : "status"}
    >
      <span className={`grid h-12 w-12 flex-none place-items-center rounded-full ${iconTone}`}>
        {error ? <ErrorIcon /> : <SuccessIcon />}
      </span>
      <span className="leading-6">{message}</span>
    </div>
  );
}

function SuccessIcon() {
  return (
    <svg aria-hidden="true" className="h-7 w-7" fill="none" viewBox="0 0 24 24">
      <path
        d="m6.5 12.5 3.5 3.5 7.5-8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.8"
      />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg aria-hidden="true" className="h-7 w-7" fill="none" viewBox="0 0 24 24">
      <path
        d="M7 7 17 17M17 7 7 17"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.8"
      />
    </svg>
  );
}
