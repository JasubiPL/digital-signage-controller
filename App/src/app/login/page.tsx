import { redirect } from "next/navigation";

import { sanitizeNextPath } from "@/lib/auth/redirect";
import { getCurrentUser } from "@/server/auth/session";

import { sendMagicLink, signInWithPassword, signUpWithPassword } from "./actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [{ error, message, next: rawNext }, user] = await Promise.all([
    searchParams,
    getCurrentUser(),
  ]);
  const next = sanitizeNextPath(rawNext);

  if (user) {
    redirect(next);
  }

  return (
    <main className="min-h-screen bg-zinc-100 px-6 py-12 text-zinc-950">
      <section className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-md flex-col justify-center">
        <div className="rounded border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-700">
            Digital Signage
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Iniciar sesion
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            Accede con Supabase Auth. Puedes usar password o solicitar un magic
            link si el proveedor esta activo en el proyecto.
          </p>

          {error ? (
            <div className="mt-5 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          ) : null}

          {message ? (
            <div className="mt-5 rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              {message}
            </div>
          ) : null}

          <form action={signInWithPassword} className="mt-6 space-y-4">
            <input name="next" type="hidden" value={next} />
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Email</span>
              <input
                autoComplete="email"
                className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-red-700"
                name="email"
                placeholder="usuario@empresa.com"
                required
                type="email"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Password</span>
              <input
                autoComplete="current-password"
                className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-red-700"
                name="password"
                required
                type="password"
              />
            </label>
            <button
              className="w-full rounded bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
              type="submit"
            >
              Entrar
            </button>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                className="w-full rounded border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
                formAction={sendMagicLink}
              >
                Magic link
              </button>
              <button
                className="w-full rounded border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
                formAction={signUpWithPassword}
              >
                Crear cuenta
              </button>
            </div>
          </form>

          <p className="mt-4 text-xs leading-5 text-zinc-500">
            Para magic link o crear cuenta, llena email/password arriba y usa el
            boton correspondiente cuando esos proveedores esten activos.
          </p>
        </div>
      </section>
    </main>
  );
}
