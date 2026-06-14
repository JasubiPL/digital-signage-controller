import Image from "next/image";

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
    email,
    id: user.id,
    isGlobalAdmin: canManageUsers,
  });

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
          </div>
          <div className="flex items-center gap-3">
            <p className="flex flex-col items-end text-sm font-extrabold text-[var(--color-text-primary)]">
              <span>Hola {displayName}</span>
              <small className="font-mono text-[10px] tracking-[0.08em] text-[var(--color-primary)]">
                {email || "correo no disponible"}
              </small>
            </p>
            <span className="relative grid h-12 w-12 place-items-center overflow-hidden rounded-full border border-[var(--color-primary-border)] bg-[var(--color-primary-muted)] shadow-[0_0_26px_rgba(34,211,238,0.14)]">
              <Image
                alt={`Avatar de ${displayName}`}
                className="h-full w-full object-cover"
                height={48}
                src={avatarSrc}
                width={48}
              />
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

function avatarSrcForHeaderUser({
  email,
  id,
  isGlobalAdmin,
}: Readonly<{
  email: string;
  id: string;
  isGlobalAdmin: boolean;
}>) {
  if (isGlobalAdmin) {
    return "/default-avatar/admin.png";
  }

  const variants = ["/default-avatar/consultant.png", "/default-avatar/manager.png"];
  const hash = Array.from(id || email).reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0,
  );

  return variants[hash % variants.length];
}
