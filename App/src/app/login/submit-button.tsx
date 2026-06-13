"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      aria-live="polite"
      className="group relative flex h-13 w-full items-center justify-center overflow-hidden rounded-md bg-red-700 px-4 text-base font-bold text-white shadow-[0_12px_26px_rgba(220,0,0,0.22)] transition hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-200 disabled:cursor-wait disabled:bg-red-800"
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
