import Link from "next/link";

import { requireUser } from "@/server/auth/session";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireUser("/dashboard");

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link className="font-semibold" href="/dashboard">
            Digital Signage Controller
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-zinc-600 sm:inline">
              {user.email}
            </span>
            <form action="/logout" method="post">
              <button className="rounded border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-50">
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}

