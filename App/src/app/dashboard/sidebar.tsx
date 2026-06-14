"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  FiAlertTriangle,
  FiChevronRight,
  FiGrid,
  FiLogOut,
  FiMonitor,
  FiRadio,
  FiUsers,
} from "react-icons/fi";

import { BrandIcon } from "@/app/brand-icon";

type Company = {
  id: string;
  legacy_code?: string | null;
  name: string;
  slug: string;
};

type DashboardSidebarProps = {
  canAccessIncidents: boolean;
  canManageUsers: boolean;
  companies: Company[];
  homeHref?: string;
  mobile?: boolean;
};

export function DashboardSidebar({
  canAccessIncidents,
  canManageUsers,
  companies,
  homeHref,
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
  const defaultHref =
    homeHref ??
    (orderedCompanies[0]
      ? `/dashboard/locations/${orderedCompanies[0].slug}`
      : "/dashboard");
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
      <nav aria-label="Navegacion movil" className="flex max-w-[calc(100vw-9rem)] gap-2 overflow-x-auto lg:hidden">
        {canManageUsers ? (
          <MobileLink
            active={pathname === "/dashboard"}
            href="/dashboard"
            onNavigate={navigate}
          >
            Dashboard
          </MobileLink>
        ) : null}
        {canManageUsers ? (
          <MobileLink
            active={pathname === "/dashboard/users"}
            href="/dashboard/users"
            onNavigate={navigate}
          >
            Usuarios
          </MobileLink>
        ) : null}
        {canAccessIncidents ? (
          <MobileLink
            active={pathname === "/dashboard/incidents"}
            href="/dashboard/incidents"
            onNavigate={navigate}
          >
            Incidentes
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
      <aside className="hidden min-h-screen w-72 flex-col justify-between border-r border-[var(--color-border)] bg-[rgba(6,14,32,0.96)] lg:flex">
        <section className="min-h-0">
          <button
            className="group mt-7 flex w-full items-center gap-3 px-6 text-left"
            onClick={() => navigate(defaultHref)}
            type="button"
          >
            <BrandIcon className="h-11 w-11 transition group-hover:border-[var(--color-primary)]" />
            <span className="grid">
              <span className="font-display text-xl font-extrabold leading-none tracking-tight text-[var(--color-primary-soft)]">
                DS Controller
              </span>
              <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                Gestor de taquillas
              </span>
            </span>
          </button>

          <nav aria-label="Navegacion principal" className="mt-10 grid gap-1.5 px-4">
            {canManageUsers ? (
              <SidebarLink
                active={pathname === "/dashboard"}
                href="/dashboard"
                icon={<FiGrid aria-hidden="true" />}
                onNavigate={navigate}
              >
                Dashboard
              </SidebarLink>
            ) : null}

            {canManageUsers ? (
              <SidebarLink
                active={pathname === "/dashboard/users"}
                href="/dashboard/users"
                icon={<FiUsers aria-hidden="true" />}
                onNavigate={navigate}
              >
                Usuarios
              </SidebarLink>
            ) : null}

            {canAccessIncidents ? (
              <SidebarLink
                active={pathname.startsWith("/dashboard/incidents")}
                href="/dashboard/incidents"
                icon={<FiAlertTriangle aria-hidden="true" />}
                onNavigate={navigate}
              >
                Incidentes
              </SidebarLink>
            ) : null}

            <SidebarGroup
              active={pathname.startsWith("/dashboard/locations")}
              companies={orderedCompanies}
              icon={<FiMonitor aria-hidden="true" />}
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
              icon={<FiRadio aria-hidden="true" />}
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

        <form action="/logout" className="border-t border-[var(--color-border)] px-4 py-5" method="post">
          <button className="flex min-h-12 w-full items-center justify-center gap-2.5 rounded-md border border-[var(--color-border)] bg-[rgba(19,27,46,0.74)] px-4 py-2.5 text-sm font-extrabold text-[var(--color-text-secondary)] transition hover:border-[var(--color-secondary)] hover:bg-[var(--color-secondary-muted)] hover:text-[var(--color-secondary-soft)] hover:shadow-[0_14px_28px_rgba(244,63,94,0.1)]">
            <FiLogOut aria-hidden="true" className="text-base" />
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
        className={`relative flex min-h-11 w-full items-center justify-between rounded-md border px-4 py-2 text-left text-sm font-extrabold transition ${
          active
            ? "border-[var(--color-primary-border)] bg-[var(--color-primary-muted)] text-[var(--color-primary-soft)] shadow-[inset_4px_0_0_var(--color-primary)]"
            : "border-transparent text-[var(--color-text-muted)] hover:border-[var(--color-border)] hover:bg-[rgba(19,27,46,0.7)] hover:text-[var(--color-primary-soft)]"
        }`}
        onClick={onToggle}
        type="button"
      >
        <span className="flex items-center gap-3">
          <span className="text-lg">{icon}</span>
          {title}
        </span>
        <ChevronIcon open={isOpen} />
      </button>

      {isOpen ? (
        <div className="ml-6 mt-2 grid gap-1 border-l border-[var(--color-border)] pb-1 pl-6">
          {companies.map((company) => {
            const href = `${routeBase}/${company.slug}`;
            const active = pathname === href;

            return (
              <button
                className={`relative min-h-9 rounded-md border px-3 py-1.5 text-left font-mono text-xs font-bold transition before:absolute before:-left-[1.55rem] before:top-1/2 before:h-px before:w-4 ${
                  active
                    ? "border-[var(--color-primary-border)] bg-[rgba(34,211,238,0.08)] text-[var(--color-primary-soft)] before:bg-[var(--color-primary)]"
                    : "border-transparent text-[var(--color-text-muted)] before:bg-[var(--color-border)] hover:border-[var(--color-border)] hover:bg-[rgba(19,27,46,0.58)] hover:text-[var(--color-primary-soft)]"
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
      className={`relative flex min-h-11 w-full items-center gap-3 rounded-md border px-4 py-2 text-sm font-extrabold transition ${
        active
          ? "border-[var(--color-primary-border)] bg-[var(--color-primary-muted)] text-[var(--color-primary-soft)] shadow-[inset_4px_0_0_var(--color-primary)]"
          : "border-transparent text-[var(--color-text-muted)] hover:border-[var(--color-border)] hover:bg-[rgba(19,27,46,0.7)] hover:text-[var(--color-primary-soft)]"
      }`}
      onClick={() => onNavigate(href)}
      type="button"
    >
      <span className="text-lg">{icon}</span>
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
      className={`min-h-10 whitespace-nowrap rounded-md border px-3.5 py-2 font-mono text-xs font-extrabold uppercase tracking-[0.08em] ${
        active
          ? "border-[var(--color-primary-border)] bg-[var(--color-primary-muted)] text-[var(--color-primary-soft)]"
          : "border-[var(--color-border)] bg-[rgba(19,27,46,0.72)] text-[var(--color-text-muted)] hover:border-[var(--color-primary-border)] hover:text-[var(--color-primary-soft)]"
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

function ChevronIcon({ open }: Readonly<{ open: boolean }>) {
  return (
    <FiChevronRight
      aria-hidden="true"
      className={`text-lg transition ${open ? "rotate-90" : ""}`}
    />
  );
}

function DashboardLoadingOverlay() {
  return (
    <div
      aria-live="polite"
      aria-label="Cargando contenido"
      className="fixed inset-0 z-50 grid place-items-center bg-[#020617]/72"
      role="status"
    >
      <div className="glass-panel-strong grid place-items-center gap-4 rounded-lg px-9 py-7">
        <span className="dashboard-spinner" />
        <span className="font-mono text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
          Cargando
        </span>
      </div>
    </div>
  );
}
