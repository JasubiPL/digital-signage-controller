"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-zinc-950 px-5 py-10 text-white">
        <main className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl flex-col justify-center">
          <section className="rounded-lg border border-white/10 bg-white/8 p-8 shadow-2xl">
            <p className="text-sm font-bold uppercase tracking-wide text-red-300">
              Digital Signage
            </p>
            <h1 className="mt-4 text-3xl font-bold">
              Algo salio mal
            </h1>
            <p className="mt-4 text-sm leading-6 text-zinc-300">
              La aplicacion encontro un error inesperado. Intenta recargar la
              vista; si vuelve a ocurrir, revisa la consola del servidor.
            </p>

            {error.digest ? (
              <p className="mt-4 text-xs text-zinc-500">
                Codigo de error: {error.digest}
              </p>
            ) : null}

            <button
              className="mt-8 rounded-md bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
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
