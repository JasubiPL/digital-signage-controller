"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

type Company = {
  id: string;
  legacy_code?: string | null;
  name: string;
  slug: string;
};

type DashboardSidebarProps = {
  canManageUsers: boolean;
  companies: Company[];
  mobile?: boolean;
};

export function DashboardSidebar({
  canManageUsers,
  companies,
  mobile = false,
}: Readonly<DashboardSidebarProps>) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const orderedCompanies = useMemo(
    () =>
      [...companies].sort((a, b) => brandLabel(a).localeCompare(brandLabel(b))),
    [companies],
  );
  const [openGroups, setOpenGroups] = useState({
    campaigns: pathname.startsWith("/dashboard/campaigns"),
    locations: pathname.startsWith("/dashboard/locations"),
  });
  const navigate = (href: string) => {
    if (href === pathname) return;

    startTransition(() => {
      router.push(href);
    });
  };

  if (mobile) {
    return (
      <nav className="flex gap-2 overflow-x-auto lg:hidden">
        <MobileLink
          active={pathname === "/dashboard"}
          href="/dashboard"
          onNavigate={navigate}
        >
          Dashboard
        </MobileLink>
        {canManageUsers ? (
          <MobileLink
            active={pathname === "/dashboard/users"}
            href="/dashboard/users"
            onNavigate={navigate}
          >
            Usuarios
          </MobileLink>
        ) : null}
        {orderedCompanies.map((company) => (
          <MobileLink
            active={pathname === `/dashboard/locations/${company.slug}`}
            href={`/dashboard/locations/${company.slug}`}
            key={`mobile-location-${company.id}`}
            onNavigate={navigate}
          >
            Taquillas {brandLabel(company)}
          </MobileLink>
        ))}
        {orderedCompanies.map((company) => (
          <MobileLink
            active={pathname === `/dashboard/campaigns/${company.slug}`}
            href={`/dashboard/campaigns/${company.slug}`}
            key={`mobile-campaign-${company.id}`}
            onNavigate={navigate}
          >
            Campañas {brandLabel(company)}
          </MobileLink>
        ))}
      </nav>
    );
  }

  return (
    <>
      <aside className="hidden min-h-screen w-[17%] min-w-64 flex-col justify-between bg-white shadow-[12px_0_30px_rgba(15,23,42,0.04)] lg:flex">
        <section>
          <button
            className="mt-10 block w-full px-8 text-center"
            onClick={() => navigate("/dashboard")}
            type="button"
          >
            <span className="block text-xl font-semibold text-zinc-700">
              Señalización Digital
            </span>
          </button>

          <nav className="mt-14 grid gap-2">
            <SidebarLink
              active={pathname === "/dashboard"}
              href="/dashboard"
              icon={<DashboardIcon />}
              onNavigate={navigate}
            >
              Dashboard
            </SidebarLink>

            {canManageUsers ? (
              <SidebarLink
                active={pathname === "/dashboard/users"}
                href="/dashboard/users"
                icon={<UsersIcon />}
                onNavigate={navigate}
              >
                Usuarios
              </SidebarLink>
            ) : null}

            <SidebarGroup
              active={pathname.startsWith("/dashboard/locations")}
              companies={orderedCompanies}
              icon={<TicketOfficeIcon />}
              isOpen={openGroups.locations}
              onNavigate={navigate}
              onToggle={() =>
                setOpenGroups((current) => ({
                  ...current,
                  locations: !current.locations,
                }))
              }
              pathname={pathname}
              routeBase="/dashboard/locations"
              title="Taquillas"
            />

            <SidebarGroup
              active={pathname.startsWith("/dashboard/campaigns")}
              companies={orderedCompanies}
              icon={<CampaignIcon />}
              isOpen={openGroups.campaigns}
              onNavigate={navigate}
              onToggle={() =>
                setOpenGroups((current) => ({
                  ...current,
                  campaigns: !current.campaigns,
                }))
              }
              pathname={pathname}
              routeBase="/dashboard/campaigns"
              title="Campañas"
            />
          </nav>
        </section>

        <form action="/logout" className="px-8 pb-8" method="post">
          <button className="w-full bg-gray-200 py-2 text-sm font-medium text-zinc-700 transition hover:bg-red-600 hover:text-white">
            Logout
          </button>
        </form>
      </aside>

      {isPending ? <DashboardLoadingOverlay /> : null}
    </>
  );
}

function SidebarGroup({
  active,
  companies,
  icon,
  isOpen,
  onNavigate,
  onToggle,
  pathname,
  routeBase,
  title,
}: Readonly<{
  active: boolean;
  companies: Company[];
  icon: React.ReactNode;
  isOpen: boolean;
  onNavigate: (href: string) => void;
  onToggle: () => void;
  pathname: string;
  routeBase: string;
  title: string;
}>) {
  return (
    <section>
      <button
        aria-expanded={isOpen}
        className={`flex w-full items-center justify-between border-l-4 px-8 py-2 text-left text-lg transition ${
          active
            ? "border-red-600 bg-red-50 text-red-600"
            : "border-white text-zinc-600 hover:border-gray-300 hover:bg-gray-100 hover:text-red-600"
        }`}
        onClick={onToggle}
        type="button"
      >
        <span className="flex items-center gap-4">
          {icon}
          {title}
        </span>
        <ChevronIcon open={isOpen} />
      </button>

      {isOpen ? (
        <div className="mt-1 grid gap-0.5 pb-1 pl-[4.5rem]">
          {companies.map((company) => {
            const href = `${routeBase}/${company.slug}`;
            const active = pathname === href;

            return (
              <button
                className={`relative py-1.5 text-left text-base transition before:absolute before:-left-[4.5rem] before:top-0 before:h-full before:w-1.5 ${
                  active
                    ? "font-semibold text-red-500 before:bg-red-600"
                    : "text-zinc-500 hover:text-red-500 before:bg-transparent"
                }`}
                key={company.id}
                onClick={() => onNavigate(href)}
                type="button"
              >
                {brandLabel(company)}
              </button>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

function SidebarLink({
  active,
  children,
  href,
  icon,
  onNavigate,
}: Readonly<{
  active: boolean;
  children: React.ReactNode;
  href: string;
  icon: React.ReactNode;
  onNavigate: (href: string) => void;
}>) {
  return (
    <button
      className={`flex items-center gap-4 border-l-4 px-8 py-2 text-lg transition ${
        active
          ? "border-red-600 bg-red-50 text-red-600"
          : "border-white text-zinc-600 hover:border-gray-300 hover:bg-gray-100 hover:text-red-600"
      }`}
      onClick={() => onNavigate(href)}
      type="button"
    >
      {icon}
      {children}
    </button>
  );
}

function MobileLink({
  active,
  children,
  href,
  onNavigate,
}: Readonly<{
  active: boolean;
  children: React.ReactNode;
  href: string;
  onNavigate: (href: string) => void;
}>) {
  return (
    <button
      className={`whitespace-nowrap border-l-4 px-3 py-1 text-sm ${
        active
          ? "border-red-600 bg-red-50 text-red-600"
          : "border-white hover:border-red-600 hover:bg-gray-200 hover:text-red-600"
      }`}
      onClick={() => onNavigate(href)}
      type="button"
    >
      {children}
    </button>
  );
}

function brandLabel(company: Company) {
  if (company.slug === "etn") return "ETN";
  if (company.slug === "gho") return "GHO";
  if (company.slug === "costaline") return "Costaline";

  return company.legacy_code || company.name;
}

function DashboardIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path d="M8.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="2" />
      <path d="M3 20a5.5 5.5 0 0 1 11 0" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path d="M16 11a3 3 0 1 0 0-6" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path d="M17.5 20H21a4.5 4.5 0 0 0-4.5-4.5" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function TicketOfficeIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path d="M5 10h14v9H5v-9Z" stroke="currentColor" strokeWidth="2" />
      <path d="M3.8 10 6 5h12l2.2 5H3.8Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
      <path d="M8 19v-5h8v5M8 7h8" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function CampaignIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path d="M4 13V9l10-4v12L4 13Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
      <path d="M14 8.5h2.5a3.5 3.5 0 0 1 0 7H14M7 13l1.4 5H12" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function ChevronIcon({ open }: Readonly<{ open: boolean }>) {
  return (
    <svg
      aria-hidden="true"
      className={`h-5 w-5 transition ${open ? "rotate-90" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path d="m9 6 6 6-6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
    </svg>
  );
}

function DashboardLoadingOverlay() {
  return (
    <div
      aria-live="polite"
      aria-label="Cargando contenido"
      className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/45 backdrop-blur-[2px]"
      role="status"
    >
      <div className="grid place-items-center gap-4 rounded-lg bg-white/92 px-9 py-7 shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
        <span className="dashboard-spinner" />
        <span className="text-sm font-semibold uppercase tracking-[0.18em] text-red-700">
          Cargando
        </span>
      </div>
    </div>
  );
}
