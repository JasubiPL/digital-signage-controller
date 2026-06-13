import { redirect } from "next/navigation";

import { sanitizeNextPath } from "@/lib/auth/redirect";
import { getCurrentUser } from "@/server/auth/session";

import { signInWithPassword } from "./actions";
import { PasswordField } from "./password-field";
import { SubmitButton } from "./submit-button";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [{ error, next: rawNext }, user] = await Promise.all([
    searchParams,
    getCurrentUser(),
  ]);
  const next = sanitizeNextPath(rawNext);

  if (user) {
    redirect(next);
  }

  return (
    <main className="login-shell min-h-screen overflow-hidden px-5 py-10 text-zinc-950">
      <div aria-hidden="true" className="login-grid-lines" />
      <div aria-hidden="true" className="login-ribbon" />
      <div aria-hidden="true" className="login-dot-field" />

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-xl flex-col justify-center">
        <div className="login-card rounded-lg border border-zinc-200/80 bg-white/82 px-7 py-9 shadow-[0_18px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:px-14 sm:py-12">
          <div className="flex items-center justify-center gap-5 text-red-700">
            <div className="flex h-11 w-[4.25rem] items-center justify-center rounded-md border-4 border-red-700">
              <PlayIcon />
            </div>
            <div className="h-11 w-px bg-zinc-200" />
            <p className="text-lg font-bold uppercase text-red-700">
              Digital Signage
            </p>
          </div>

          <h1 className="mt-12 text-center text-3xl font-bold text-zinc-950 sm:text-4xl">
            Iniciar sesión
          </h1>
          <div className="mx-auto mt-5 h-0.5 w-12 rounded-full bg-red-500" />

          {error ? (
            <div className="mt-8 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
              {error}
            </div>
          ) : null}

          <form action={signInWithPassword} className="mt-8 space-y-6">
            <input name="next" type="hidden" value={next} />
            <label className="block">
              <span className="text-sm font-bold text-zinc-900">Email</span>
              <span className="relative mt-3 block">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                >
                  <MailIcon />
                </span>
                <input
                  autoComplete="email"
                  className="h-12 w-full rounded-md border border-zinc-300 bg-white/75 px-12 text-base text-zinc-900 outline-none transition focus:border-red-600 focus:bg-white focus:ring-4 focus:ring-red-100"
                  name="email"
                  placeholder="usuario@empresa.com"
                  required
                  type="email"
                />
              </span>
            </label>
            <PasswordField />
            <SubmitButton />
          </form>

          <div className="mt-10 flex items-center gap-4 text-red-600">
            <div className="h-px flex-1 bg-zinc-200" />
            <ShieldIcon />
            <div className="h-px flex-1 bg-zinc-200" />
          </div>

          <p className="mt-7 flex items-center justify-center gap-3 text-center text-sm leading-6 text-zinc-500">
            <UsersIcon />
            <span>
              Las cuentas se deben solicitar al administrador del sistema.
            </span>
          </p>
        </div>
      </section>
    </main>
  );
}

function PlayIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5.8v12.4L18.4 12 8 5.8Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path
        d="M4.8 6.5h14.4c.7 0 1.3.6 1.3 1.3v8.4c0 .7-.6 1.3-1.3 1.3H4.8c-.7 0-1.3-.6-1.3-1.3V7.8c0-.7.6-1.3 1.3-1.3Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="m4 8 8 5.6L20 8" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 3.8 18.2 6v5.3c0 4-2.5 7.4-6.2 8.9-3.7-1.5-6.2-4.9-6.2-8.9V6L12 3.8Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path d="M12 8v5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <path d="M9.8 10.2 12 8l2.2 2.2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 flex-none" fill="none" viewBox="0 0 24 24">
      <path
        d="M9 11.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M3.8 18.5c.4-2.8 2.5-4.6 5.2-4.6s4.8 1.8 5.2 4.6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <path
        d="M16.3 12a2.4 2.4 0 1 0 0-4.8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
      <path
        d="M16.8 14.2c1.8.5 3 2 3.4 4.3"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
