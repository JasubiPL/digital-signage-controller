import { getDashboardContext } from "./data";
import { DashboardSidebar } from "./sidebar";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { access, companies, user } = await getDashboardContext("/dashboard");
  const canManageUsers = access.isGlobalAdmin;

  return (
    <div className="flex min-h-screen bg-gray-100 text-zinc-950">
      <DashboardSidebar canManageUsers={canManageUsers} companies={companies} />

      <section className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between bg-white px-6 py-2">
          <DashboardSidebar
            canManageUsers={canManageUsers}
            companies={companies}
            mobile
          />
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <p className="flex flex-col items-end text-sm font-semibold">
              <span>Hola {user.email?.split("@")[0] ?? "usuario"}</span>
              <small className="text-[10px] uppercase text-gray-400">
                Supabase Auth
              </small>
            </p>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-red-100 text-sm font-bold text-red-700">
              {(user.email?.[0] ?? "U").toUpperCase()}
            </span>
          </div>
        </header>
        <main className="h-full flex-1 overflow-y-auto px-6 py-8">{children}</main>
      </section>
    </div>
  );
}
