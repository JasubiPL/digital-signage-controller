"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      aria-live="polite"
      className="group relative flex h-13 w-full items-center justify-center overflow-hidden rounded-md border border-[var(--color-primary-border)] bg-[var(--color-primary)] px-4 text-base font-extrabold text-[#04131b] transition hover:-translate-y-0.5 hover:bg-[var(--color-primary-soft)] hover:shadow-[0_18px_42px_rgba(34,211,238,0.18)] focus:outline-none focus:ring-4 focus:ring-[rgba(34,211,238,0.18)] disabled:cursor-wait disabled:opacity-75"
      disabled={pending}
      type="submit"
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/18 to-transparent transition duration-700 group-disabled:translate-x-0"
      />
      <span className="relative flex items-center gap-3">
        {pending ? <span aria-hidden="true" className="login-spinner" /> : null}
        {pending ? "Autenticando" : "Entrar"}
      </span>
    </button>
  );
}
