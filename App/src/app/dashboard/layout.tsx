import Link from "next/link";

import { requireUser } from "@/server/auth/session";

const navItems = [
  ["Dashboard", "/dashboard"],
  ["Taquillas", "/dashboard/locations"],
  ["Campanas", "/dashboard/campaigns"],
  ["Pantallas", "/dashboard/screens"],
  ["Asignaciones", "/dashboard/assignments"],
  ["Archivos", "/dashboard/files"],
] as const;

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireUser("/dashboard");

  return (
    <div className="flex min-h-screen bg-gray-100 text-zinc-950">
      <aside className="hidden min-h-screen w-[15%] min-w-56 flex-col justify-between bg-white lg:flex">
        <section>
          <Link
            className="relative mt-4 flex items-center justify-center gap-2 px-4 after:absolute after:left-[70%] after:top-7 after:content-['V2.2.0'] after:text-[11px] after:font-bold after:text-red-600"
            href="/dashboard"
          >
            <span className="grid h-9 w-9 place-items-center rounded-sm bg-red-700 text-sm font-bold text-white">
              GI
            </span>
            <span className="text-sm font-semibold leading-tight">
              Senalizacion Digital
            </span>
          </Link>
          <nav className="mt-8 grid gap-2">
            {navItems.map(([label, href]) => (
              <Link
                className="border-l-4 border-white px-5 py-2 text-lg hover:border-gray-400 hover:bg-gray-200 hover:text-red-600"
                href={href}
                key={href}
              >
                {label}
              </Link>
            ))}
          </nav>
        </section>

        <form action="/logout" className="px-6 pb-6" method="post">
          <button className="w-full bg-gray-200 py-2 text-sm font-medium hover:bg-red-600 hover:text-white">
            Logout
          </button>
        </form>
      </aside>

      <section className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between bg-white px-6 py-2">
          <nav className="flex gap-2 overflow-x-auto lg:hidden">
            {navItems.map(([label, href]) => (
              <Link
                className="whitespace-nowrap border-l-4 border-white px-3 py-1 text-sm hover:border-red-600 hover:bg-gray-200 hover:text-red-600"
                href={href}
                key={href}
              >
                {label}
              </Link>
            ))}
          </nav>
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

