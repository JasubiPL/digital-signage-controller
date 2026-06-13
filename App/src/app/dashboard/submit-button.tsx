"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  className,
  pendingLabel = "Guardando...",
}: Readonly<{
  children: React.ReactNode;
  className: string;
  pendingLabel?: string;
}>) {
  const { pending } = useFormStatus();

  return (
    <button
      className={`${className} disabled:cursor-not-allowed disabled:opacity-75`}
      disabled={pending}
      type="submit"
    >
      {pending ? <Spinner /> : null}
      <span>{pending ? pendingLabel : children}</span>
    </button>
  );
}

export function IconSubmitButton({
  children,
  className,
  label,
}: Readonly<{
  children: React.ReactNode;
  className: string;
  label: string;
}>) {
  const { pending } = useFormStatus();

  return (
    <button
      className={`${className} disabled:cursor-not-allowed disabled:opacity-75`}
      disabled={pending}
      title={label}
      type="submit"
    >
      <span className="sr-only">{pending ? "Procesando" : label}</span>
      {pending ? <Spinner compact /> : children}
    </button>
  );
}

function Spinner({ compact = false }: Readonly<{ compact?: boolean }>) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block rounded-full border-2 border-current border-r-transparent motion-safe:animate-spin ${
        compact ? "h-5 w-5" : "mr-2 h-4 w-4"
      }`}
    />
  );
}
