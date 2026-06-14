import Image from "next/image";

import { SystemFooter } from "@/app/system-footer";

import { getDashboardContext } from "./data";
import { DashboardSidebar } from "./sidebar";

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
  const email = user.email ?? "";
  const displayName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    email.split("@")[0] ??
    "usuario";
  const avatarSrc = avatarSrcForHeaderUser({
    isGlobalAdmin: canManageUsers,
    isManager: access.isManager,
  });

  return (
    <div className="noc-grid flex min-h-screen font-sans text-[var(--color-text-primary)]">
      <DashboardSidebar
        canAccessIncidents={access.canAccessIncidents}
        canManageUsers={canManageUsers}
        companies={companies}
        homeHref={homeHref}
      />

      <section className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--color-border)] bg-[rgba(6,14,32,0.96)] px-5 py-2">
          <div className="flex min-w-0 items-center gap-3">
            <DashboardSidebar
              canAccessIncidents={access.canAccessIncidents}
              canManageUsers={canManageUsers}
              companies={companies}
              homeHref={homeHref}
              mobile
            />
          </div>
          <div className="flex items-center gap-2.5">
            <p className="flex flex-col items-end text-xs font-extrabold text-[var(--color-text-primary)]">
              <span>Hola {displayName}</span>
              <small className="font-mono text-[9px] tracking-[0.08em] text-[var(--color-primary)]">
                {email || "correo no disponible"}
              </small>
            </p>
            <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-[var(--color-primary-border)] bg-[var(--color-primary-muted)]">
              <Image
                alt={`Avatar de ${displayName}`}
                className="h-full w-full object-cover"
                height={40}
                src={avatarSrc}
                width={40}
              />
            </span>
          </div>
        </header>
        <main className="h-full flex-1 overflow-y-auto px-5 py-6 lg:px-6">
          {children}
        </main>
        <SystemFooter className="border-t border-[var(--color-border)] bg-[rgba(6,14,32,0.78)] px-5 py-4 lg:px-6" />
      </section>
    </div>
  );
}

function avatarSrcForHeaderUser({
  isGlobalAdmin,
  isManager,
}: Readonly<{
  isGlobalAdmin: boolean;
  isManager: boolean;
}>) {
  if (isGlobalAdmin) {
    return "/default-avatar/admin.png";
  }

  if (isManager) {
    return "/default-avatar/manager.png";
  }

  return "/default-avatar/consultant.png";
}
