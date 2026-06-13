import { getDashboardContext } from "./data";
import { DashboardSidebar } from "./sidebar";
import { ThemeToggle } from "./theme-toggle";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { access, companies, user } = await getDashboardContext("/dashboard");
  const canManageUsers = access.isGlobalAdmin;

  return (
    <div className="flex min-h-screen bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_42%,#f3f6fb_100%)] font-['Avenir_Next','Aptos','Segoe_UI',sans-serif] text-slate-900 transition-colors theme-dark:bg-[linear-gradient(135deg,#020617_0%,#0f172a_46%,#111827_100%)] theme-dark:text-slate-100">
      <DashboardSidebar canManageUsers={canManageUsers} companies={companies} />

      <section className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white/90 px-6 py-3 shadow-[0_14px_42px_rgba(15,23,42,0.06)] backdrop-blur transition-colors theme-dark:border-slate-800 theme-dark:bg-slate-950/88 theme-dark:shadow-[0_14px_42px_rgba(0,0,0,0.22)]">
          <DashboardSidebar
            canManageUsers={canManageUsers}
            companies={companies}
            mobile
          />
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <p className="flex flex-col items-end text-sm font-extrabold text-slate-700 theme-dark:text-slate-200">
              <span>Hola {user.email?.split("@")[0] ?? "usuario"}</span>
              <small className="text-[10px] uppercase tracking-[0.18em] text-slate-400 theme-dark:text-slate-500">
                Supabase Auth
              </small>
            </p>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-red-50 text-sm font-extrabold text-red-600 shadow-[0_16px_34px_rgba(220,38,38,0.12)] theme-dark:bg-red-950/50 theme-dark:text-red-300">
              {(user.email?.[0] ?? "U").toUpperCase()}
            </span>
          </div>
        </header>
        <main className="h-full flex-1 overflow-y-auto px-6 py-8 lg:px-8">{children}</main>
      </section>
    </div>
  );
}
