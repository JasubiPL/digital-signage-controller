import type { ReactNode } from "react";
import {
  FiBarChart2,
  FiEdit3,
  FiEye,
  FiMonitor,
  FiTrash2,
} from "react-icons/fi";

import { IconSubmitButton } from "./submit-button";

type ListingHeaderProps = {
  action?: ReactNode;
  count: number;
  icon: "campaigns" | "locations";
  metricLabel: string;
  title: string;
};

type ActionTone = "delete" | "edit" | "view";

const actionToneClass: Record<ActionTone, string> = {
  delete: "text-[var(--color-secondary-soft)] hover:border-[rgba(244,63,94,0.42)] hover:text-[var(--color-secondary)]",
  edit: "text-[var(--color-tertiary)] hover:border-[rgba(255,177,59,0.42)] hover:text-[var(--color-tertiary-soft)]",
  view: "text-[var(--color-primary)] hover:border-[rgba(34,211,238,0.42)] hover:text-[var(--color-primary-soft)]",
};

const actionIconClass =
  "inline-grid h-9 w-9 place-items-center rounded-md border border-[rgba(20,33,58,0.88)] bg-[rgba(3,10,24,0.86)] transition hover:-translate-y-0.5 hover:bg-[rgba(7,18,37,0.96)] hover:shadow-[0_12px_24px_rgba(34,211,238,0.1)]";

export function ListingHeader({
  action,
  count,
  icon,
  metricLabel,
  title,
}: Readonly<ListingHeaderProps>) {
  return (
    <header className="grid items-center gap-4 rounded-lg px-5 py-4 md:grid-cols-[1fr_auto_1fr]">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-lg border border-[var(--color-primary-border)] bg-[var(--color-primary-muted)] text-[var(--color-primary)]">
          <MetricIcon icon={icon} />
        </span>
        <p className="font-display text-lg font-extrabold tracking-tight text-[var(--color-text-primary)]">
          {metricLabel}: <span className="text-[var(--color-primary)]">{count}</span>
        </p>
      </div>

      <div className="text-center">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
          {title}
        </h1>
        <span className="mx-auto mt-3 block h-0.5 w-16 rounded-sm bg-[var(--color-primary)]" />
      </div>

      <div className="flex justify-start md:justify-end">{action}</div>
    </header>
  );
}

export function ListingPrimaryAction({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <span className="inline-flex min-h-12 items-center justify-center rounded-md border border-[var(--color-primary-border)] bg-[var(--color-primary)] px-6 py-2 text-sm font-extrabold text-[#001f25] transition hover:-translate-y-0.5 hover:bg-[var(--color-primary-soft)] hover:shadow-[0_18px_36px_rgba(34,211,238,0.18)]">
      {children}
    </span>
  );
}

export function ListingTableShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <section className="glass-panel overflow-hidden rounded-lg">
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}

export const listingTableClass =
  "w-full min-w-[820px] border-collapse text-left text-sm text-[var(--color-text-secondary)]";

export const listingHeadClass =
  "border-b border-[var(--color-border)] bg-[rgba(6,14,32,0.78)] font-mono text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--color-text-muted)]";

export const listingHeaderCellClass = "px-5 py-4";

export const listingRowClass =
  "border-b border-[var(--color-border)] last:border-b-0 transition hover:bg-[rgba(34,211,238,0.045)]";

export const listingCellClass = "px-5 py-4 align-middle";

export const listingActionCellClass = "px-5 py-3 align-middle";

export function ListingStatusBadge({ children }: Readonly<{ children: ReactNode }>) {
  const value = String(children).toLowerCase();
  const labelByStatus: Record<string, string> = {
    active: "Activa",
    admin: "Admin",
    archived: "Archivada",
    designer: "Diseno",
    draft: "Pendiente de Carga",
    inactive: "Inactiva",
    incident: "Incidente",
    maintenance: "Mantenimiento",
    manager: "Manager",
    ok: "OK",
    operator: "Operador",
    remodeling: "Remodelacion",
    super_admin: "Super usuario",
    user: "Consultor",
    viewer: "Consulta",
  };
  const isHealthy = value === "active" || value === "ok";
  const isGood = value === "super_admin";
  const isManager = value === "manager";
  const isWarning = value === "remodeling" || value === "maintenance";
  const isPending = value === "draft";
  const isDanger = value === "incident" || value === "archived" || value === "inactive";
  const tone = isHealthy
    ? "border-[rgba(34,197,94,0.4)] bg-[rgba(34,197,94,0.12)] text-[#86efac]"
    : isGood
    ? "border-[var(--color-primary-border)] bg-[var(--color-primary-muted)] text-[var(--color-primary-soft)]"
    : isManager
      ? "border-[rgba(255,177,59,0.34)] bg-[var(--color-tertiary-muted)] text-[var(--color-tertiary-soft)]"
      : isWarning
      ? "border-[rgba(244,63,94,0.34)] bg-[var(--color-secondary-muted)] text-[var(--color-secondary-soft)]"
      : isPending
        ? "border-[rgba(255,177,59,0.34)] bg-[var(--color-tertiary-muted)] text-[var(--color-tertiary-soft)]"
        : isDanger
          ? "border-[rgba(244,63,94,0.34)] bg-[var(--color-secondary-muted)] text-[var(--color-secondary-soft)]"
          : "border-[var(--color-border)] bg-[rgba(148,163,184,0.08)] text-[var(--color-text-soft)]";

  return (
    <span className={`inline-flex min-w-28 items-center justify-center gap-2.5 rounded-full border px-4 py-1.5 font-mono text-xs font-extrabold ${tone}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {labelByStatus[value] ?? children}
    </span>
  );
}

export function ActionIconTrigger({
  label,
  tone,
}: Readonly<{
  label: string;
  tone: ActionTone;
}>) {
  return (
    <span className={`${actionIconClass} ${actionToneClass[tone]}`} title={label}>
      <span className="sr-only">{label}</span>
      <ActionGlyph tone={tone} />
    </span>
  );
}

export function DeleteActionButton({ label = "Eliminar" }: Readonly<{ label?: string }>) {
  return (
    <IconSubmitButton
      className={`${actionIconClass} ${actionToneClass.delete}`}
      label={label}
    >
      <ActionGlyph tone="delete" />
    </IconSubmitButton>
  );
}

function MetricIcon({ icon }: Readonly<{ icon: "campaigns" | "locations" }>) {
  if (icon === "locations") {
    return <FiMonitor aria-hidden="true" className="h-6 w-6" />;
  }

  return <FiBarChart2 aria-hidden="true" className="h-6 w-6" />;
}

function ActionGlyph({ tone }: Readonly<{ tone: ActionTone }>) {
  if (tone === "view") {
    return <FiEye aria-hidden="true" className="h-4 w-4" />;
  }

  if (tone === "edit") {
    return <FiEdit3 aria-hidden="true" className="h-4 w-4" />;
  }

  return <FiTrash2 aria-hidden="true" className="h-4 w-4" />;
}
