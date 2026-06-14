"use client";

import { BrandIcon } from "@/app/brand-icon";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[var(--color-bg)] px-5 py-10 text-[var(--color-text-primary)]">
        <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl flex-col justify-center">
          <section className="glass-panel-strong rounded-lg p-8">
            <div className="flex items-center gap-3">
              <BrandIcon className="h-10 w-10" />
              <p className="mono-label text-sm text-[var(--color-primary)]">
                DS Controller
              </p>
            </div>
            <h1 className="mt-4 text-3xl font-bold">
              Algo salio mal
            </h1>
            <p className="mt-4 text-sm leading-6 text-[var(--color-text-soft)]">
              La aplicacion encontro un error inesperado. Intenta recargar la
              vista; si vuelve a ocurrir, revisa la consola del servidor.
            </p>

            {error.digest ? (
              <p className="mt-4 text-xs text-[var(--color-text-muted)]">
                Codigo de error: {error.digest}
              </p>
            ) : null}

            <button
              className="mt-8 rounded-md border border-[var(--color-primary-border)] bg-[var(--color-primary)] px-4 py-2 text-sm font-bold text-[#04131b] transition hover:bg-[var(--color-primary-soft)]"
              onClick={reset}
              type="button"
            >
              Reintentar
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
