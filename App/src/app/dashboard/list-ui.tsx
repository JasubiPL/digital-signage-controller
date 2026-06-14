import type { ReactNode } from "react";
import {
  FiBarChart2,
  FiCheckCircle,
  FiClock,
  FiEdit3,
  FiEye,
  FiMinusCircle,
  FiMonitor,
  FiTrash2,
  FiXCircle,
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
  delete: "border-[rgba(244,63,94,0.24)] bg-[rgba(244,63,94,0.08)] text-[var(--color-secondary-soft)] hover:border-[var(--color-secondary)] hover:bg-[var(--color-secondary-muted)]",
  edit: "border-[rgba(255,177,59,0.24)] bg-[rgba(255,177,59,0.08)] text-[var(--color-tertiary)] hover:border-[var(--color-tertiary)] hover:bg-[var(--color-tertiary-muted)]",
  view: "border-[rgba(34,211,238,0.24)] bg-[rgba(34,211,238,0.08)] text-[var(--color-primary)] hover:border-[var(--color-primary-border)] hover:bg-[var(--color-primary-muted)]",
};

export function ListingHeader({
  action,
  count,
  icon,
  metricLabel,
  title,
}: Readonly<ListingHeaderProps>) {
  return (
    <header className="glass-panel grid items-center gap-5 rounded-lg px-6 py-5 md:grid-cols-[1fr_auto_1fr]">
      <div className="flex items-center gap-4">
        <span className="grid h-14 w-14 place-items-center rounded-lg border border-[var(--color-primary-border)] bg-[var(--color-primary-muted)] text-[var(--color-primary)] shadow-[0_0_24px_rgba(34,211,238,0.12)]">
          <MetricIcon icon={icon} />
        </span>
        <p className="font-display text-xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
          {metricLabel}: <span className="text-[var(--color-primary)]">{count}</span>
        </p>
      </div>

      <div className="text-center">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
          {title}
        </h1>
        <span className="mx-auto mt-4 block h-1 w-20 rounded-sm bg-[var(--color-primary)] shadow-[0_0_18px_rgba(34,211,238,0.45)]" />
      </div>

      <div className="flex justify-start md:justify-end">{action}</div>
    </header>
  );
}

export function ListingPrimaryAction({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <span className="inline-flex min-h-14 items-center justify-center rounded-md border border-[var(--color-primary-border)] bg-[var(--color-primary)] px-7 py-3 text-base font-extrabold text-[#001f25] shadow-[0_18px_36px_rgba(34,211,238,0.18)] transition hover:-translate-y-0.5 hover:bg-[var(--color-primary-soft)] hover:shadow-[0_22px_42px_rgba(34,211,238,0.25)]">
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
  "w-full min-w-[900px] border-collapse text-left text-base text-[var(--color-text-secondary)]";

export const listingHeadClass =
  "border-b border-[var(--color-border)] bg-[rgba(6,14,32,0.78)] font-mono text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--color-text-muted)]";

export const listingHeaderCellClass = "px-7 py-5";

export const listingRowClass =
  "border-b border-[var(--color-border)] last:border-b-0 transition hover:bg-[rgba(34,211,238,0.045)]";

export const listingCellClass = "px-7 py-5 align-middle";

export const listingActionCellClass = "px-7 py-4 align-middle";

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
    ok: "OK",
    operator: "Operador",
    remodeling: "Remodelacion",
    super_admin: "Super usuario",
    user: "Usuario consulta",
    viewer: "Consulta",
  };
  const isGood = value === "active" || value === "ok" || value === "super_admin";
  const isWarning = value === "draft" || value === "remodeling" || value === "maintenance";
  const isDanger = value === "incident" || value === "archived" || value === "inactive";
  const tone = isGood
    ? "border-[var(--color-primary-border)] bg-[var(--color-primary-muted)] text-[var(--color-primary-soft)]"
    : isWarning
      ? "border-[rgba(255,177,59,0.34)] bg-[var(--color-tertiary-muted)] text-[var(--color-tertiary-soft)]"
      : isDanger
        ? "border-[rgba(244,63,94,0.34)] bg-[var(--color-secondary-muted)] text-[var(--color-secondary-soft)]"
        : "border-[var(--color-border)] bg-[rgba(148,163,184,0.08)] text-[var(--color-text-soft)]";

  return (
    <span className={`inline-flex min-w-36 items-center justify-center gap-2 rounded-md border px-4 py-2.5 font-mono text-sm font-bold ${tone}`}>
      <StatusIcon tone={isGood ? "good" : isWarning ? "warning" : isDanger ? "danger" : "neutral"} />
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
    <span className={`inline-grid h-12 w-12 place-items-center rounded-md border shadow-[0_14px_28px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5 ${actionToneClass[tone]}`} title={label}>
      <span className="sr-only">{label}</span>
      <ActionGlyph tone={tone} />
    </span>
  );
}

export function DeleteActionButton({ label = "Eliminar" }: Readonly<{ label?: string }>) {
  return (
    <IconSubmitButton
      className={`inline-grid h-12 w-12 place-items-center rounded-md border shadow-[0_14px_28px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5 ${actionToneClass.delete}`}
      label={label}
    >
      <ActionGlyph tone="delete" />
    </IconSubmitButton>
  );
}

function MetricIcon({ icon }: Readonly<{ icon: "campaigns" | "locations" }>) {
  if (icon === "locations") {
    return <FiMonitor aria-hidden="true" className="h-7 w-7" />;
  }

  return <FiBarChart2 aria-hidden="true" className="h-7 w-7" />;
}

function StatusIcon({ tone }: Readonly<{ tone: "danger" | "good" | "neutral" | "warning" }>) {
  if (tone === "good") {
    return <FiCheckCircle aria-hidden="true" className="h-5 w-5" />;
  }

  if (tone === "warning") {
    return <FiClock aria-hidden="true" className="h-5 w-5" />;
  }

  if (tone === "danger") {
    return <FiXCircle aria-hidden="true" className="h-5 w-5" />;
  }

  return <FiMinusCircle aria-hidden="true" className="h-5 w-5" />;
}

function ActionGlyph({ tone }: Readonly<{ tone: ActionTone }>) {
  if (tone === "view") {
    return <FiEye aria-hidden="true" className="h-5 w-5" />;
  }

  if (tone === "edit") {
    return <FiEdit3 aria-hidden="true" className="h-5 w-5" />;
  }

  return <FiTrash2 aria-hidden="true" className="h-5 w-5" />;
}
