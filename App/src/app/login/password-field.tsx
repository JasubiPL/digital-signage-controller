"use client";

import { useState } from "react";

export function PasswordField() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <label className="block">
      <span className="text-sm font-bold text-zinc-900">Contraseña</span>
      <span className="relative mt-3 block">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
        >
          <LockIcon />
        </span>
        <input
          autoComplete="current-password"
          className="h-12 w-full rounded-md border border-zinc-300 bg-white/75 px-12 pr-14 text-base text-zinc-900 outline-none transition focus:border-red-600 focus:bg-white focus:ring-4 focus:ring-red-100"
          name="password"
          required
          type={showPassword ? "text" : "password"}
        />
        <button
          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={showPassword}
          className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 focus:outline-none focus:ring-4 focus:ring-red-100"
          onClick={() => setShowPassword((value) => !value)}
          type="button"
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </span>
    </label>
  );
}

function LockIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M7 10.5V8.3a5 5 0 0 1 10 0v2.2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <path
        d="M6.5 10.5h11c.8 0 1.5.7 1.5 1.5v6c0 .8-.7 1.5-1.5 1.5h-11C5.7 19.5 5 18.8 5 18v-6c0-.8.7-1.5 1.5-1.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 14v2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M3.8 12s3-5 8.2-5 8.2 5 8.2 5-3 5-8.2 5-8.2-5-8.2-5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 14.6a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M4 4 20 20"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <path
        d="M9.6 5.5A9 9 0 0 1 12 5.2c5.2 0 8.2 5 8.2 5a14.2 14.2 0 0 1-2.4 2.9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <path
        d="M14.6 12.8A2.6 2.6 0 0 1 11.2 9.4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <path
        d="M6.5 7.4a14.8 14.8 0 0 0-2.7 2.8s3 5 8.2 5c.9 0 1.7-.1 2.5-.4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
