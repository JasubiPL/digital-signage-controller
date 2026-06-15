import { redirect } from "next/navigation";
import { FiMail, FiShield, FiUsers } from "react-icons/fi";

import { BrandIcon } from "@/app/brand-icon";
import { SystemFooter } from "@/app/system-footer";
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
    <main className="login-shell flex min-h-screen flex-col overflow-hidden px-5 py-8 text-[var(--color-text-primary)]">
      <div aria-hidden="true" className="login-grid-lines" />

      <section className="relative z-10 mx-auto flex w-full max-w-xl flex-1 flex-col justify-center py-8">
        <div className="login-card glass-panel-strong rounded-lg px-7 py-9 sm:px-14 sm:py-12">
          <div className="flex items-center justify-center gap-5 text-[var(--color-primary)]">
            <BrandIcon className="h-12 w-12" priority />
            <div className="h-11 w-px bg-[var(--color-border)]" />
            <div>
              <p className="font-display text-2xl font-extrabold tracking-tight text-[var(--color-primary-soft)]">
                DS Controller
              </p>
              <p className="mono-label mt-1 text-xs text-[var(--color-text-muted)]">
                Gestor de taquillas
              </p>
            </div>
          </div>

          <h1 className="mt-12 text-center font-display text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)] sm:text-4xl">
            Iniciar sesión
          </h1>
          <div className="mx-auto mt-5 h-0.5 w-14 rounded-full bg-[var(--color-primary)]" />

          {error ? (
            <div className="mt-8 rounded-md border border-[rgba(244,63,94,0.34)] bg-[var(--color-secondary-muted)] px-4 py-3 text-sm font-semibold text-[var(--color-secondary-soft)]">
              {error}
            </div>
          ) : null}

          <form action={signInWithPassword} className="mt-8 space-y-6">
            <input name="next" type="hidden" value={next} />
            <label className="block">
              <span className="mono-label text-xs text-[var(--color-text-muted)]">Email</span>
              <span className="relative mt-3 block">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-primary)]"
                >
                  <FiMail className="h-5 w-5" />
                </span>
                <input
                  autoComplete="email"
                  className="h-12 w-full rounded-md border border-[var(--color-border)] bg-[rgba(7,18,31,0.86)] px-12 text-base font-semibold text-[var(--color-text-primary)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary-border)] focus:ring-4 focus:ring-[rgba(34,211,238,0.16)]"
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

          <div className="mt-10 flex items-center gap-4 text-[var(--color-primary)]">
            <div className="h-px flex-1 bg-[var(--color-border)]" />
            <FiShield aria-hidden="true" className="h-6 w-6" />
            <div className="h-px flex-1 bg-[var(--color-border)]" />
          </div>

          <p className="mt-7 flex items-center justify-center gap-3 text-center text-sm font-semibold leading-6 text-[var(--color-text-muted)]">
            <FiUsers aria-hidden="true" className="h-5 w-5 flex-none text-[var(--color-primary-soft)]" />
            <span>
              Las cuentas se deben solicitar al administrador del sistema.
            </span>
          </p>
        </div>
      </section>
      <SystemFooter className="relative z-10 pb-1" />
    </main>
  );
}
