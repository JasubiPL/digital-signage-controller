"use client";

import { useState } from "react";
import { FiEye, FiEyeOff, FiLock } from "react-icons/fi";

export function PasswordField() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <label className="block">
      <span className="mono-label text-xs text-[var(--color-text-muted)]">Contraseña</span>
      <span className="relative mt-3 block">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-primary)]"
        >
          <FiLock className="h-5 w-5" />
        </span>
        <input
          autoComplete="current-password"
          className="h-12 w-full rounded-md border border-[var(--color-border)] bg-[rgba(7,18,31,0.86)] px-12 pr-14 text-base font-semibold text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-primary-border)] focus:ring-4 focus:ring-[rgba(34,211,238,0.16)]"
          name="password"
          required
          type={showPassword ? "text" : "password"}
        />
        <button
          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={showPassword}
          className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-[var(--color-text-muted)] transition hover:bg-[var(--color-primary-muted)] hover:text-[var(--color-primary-soft)] focus:outline-none focus:ring-4 focus:ring-[rgba(34,211,238,0.16)]"
          onClick={() => setShowPassword((value) => !value)}
          type="button"
        >
          {showPassword ? <FiEyeOff aria-hidden="true" className="h-5 w-5" /> : <FiEye aria-hidden="true" className="h-5 w-5" />}
        </button>
      </span>
    </label>
  );
}
