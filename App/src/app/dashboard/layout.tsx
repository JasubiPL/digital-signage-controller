import { getDashboardContext } from "./data";
import { DashboardSidebar } from "./sidebar";
import { FiActivity } from "react-icons/fi";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { access, companies, user } = await getDashboardContext("/dashboard");
  const canManageUsers = access.isGlobalAdmin;
  const homeHref = canManageUsers
    ? "/dashboard"
    : companies[0]
      ? `/dashboard/locations/${companies[0].slug}`
      : "/dashboard/locations";

  return (
    <div className="noc-grid flex min-h-screen font-sans text-[var(--color-text-primary)]">
      <DashboardSidebar
        canManageUsers={canManageUsers}
        companies={companies}
        homeHref={homeHref}
      />

      <section className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--color-border)] bg-[rgba(6,14,32,0.86)] px-6 py-3 shadow-[0_14px_42px_rgba(0,0,0,0.22)] backdrop-blur-xl">
          <div className="flex min-w-0 items-center gap-3">
            <DashboardSidebar
              canManageUsers={canManageUsers}
              companies={companies}
              homeHref={homeHref}
              mobile
            />
            <div className="hidden min-w-0 items-center gap-3 lg:flex">
              <span className="grid h-10 w-10 place-items-center rounded-lg border border-[var(--color-primary-border)] bg-[var(--color-primary-muted)] text-[var(--color-primary)]">
                <FiActivity aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="font-display text-lg font-extrabold tracking-tight text-[var(--color-primary-soft)]">
                  DS Controller
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                  Gestor de taquillas
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="flex flex-col items-end text-sm font-extrabold text-[var(--color-text-primary)]">
              <span>Hola {user.email?.split("@")[0] ?? "usuario"}</span>
              <small className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-primary)]">
                Supabase Auth
              </small>
            </p>
            <span className="grid h-12 w-12 place-items-center rounded-full border border-[var(--color-primary-border)] bg-[var(--color-primary-muted)] text-sm font-extrabold text-[var(--color-primary-soft)] shadow-[0_0_26px_rgba(34,211,238,0.14)]">
              {(user.email?.[0] ?? "U").toUpperCase()}
            </span>
          </div>
        </header>
        <main className="h-full flex-1 overflow-y-auto px-6 py-8 lg:px-8">
          {children}
        </main>
      </section>
    </div>
  );
}
