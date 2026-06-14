"use client";

import { useEffect, useState } from "react";
import { FiCheck, FiX } from "react-icons/fi";

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
    ? "border-[rgba(244,63,94,0.34)] bg-[rgba(69,10,10,0.94)] text-[var(--color-secondary-soft)]"
    : "border-[var(--color-primary-border)] bg-[rgba(6,14,32,0.96)] text-[var(--color-primary-soft)]";
  const iconTone = error
    ? "border-[rgba(244,63,94,0.38)] bg-[var(--color-secondary-muted)] text-[var(--color-secondary-soft)]"
    : "border-[var(--color-primary-border)] bg-[var(--color-primary-muted)] text-[var(--color-primary-soft)]";

  return (
    <div
      aria-live="polite"
      className={`fixed left-1/2 top-6 z-[80] flex w-[min(92vw,38rem)] -translate-x-1/2 items-center gap-4 rounded-lg border px-7 py-5 text-base font-extrabold transition-all duration-300 ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "-translate-y-4 pointer-events-none opacity-0"
      } ${tone}`}
      role={error ? "alert" : "status"}
    >
      <span className={`grid h-12 w-12 flex-none place-items-center rounded-md border ${iconTone}`}>
        {error ? <ErrorIcon /> : <SuccessIcon />}
      </span>
      <span className="leading-6">{message}</span>
    </div>
  );
}

function SuccessIcon() {
  return <FiCheck aria-hidden="true" className="h-7 w-7" />;
}

function ErrorIcon() {
  return <FiX aria-hidden="true" className="h-7 w-7" />;
}
