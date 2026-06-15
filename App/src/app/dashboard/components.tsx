import Link from "next/link";

import { FeedbackToast } from "./feedback-toast";

export type SearchFeedback = {
  error?: string;
  success?: string;
};

export function PageHeader({
  eyebrow,
  title,
  children,
}: Readonly<{
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}>) {
  return (
    <section className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
      <div>
        <p className="mono-label text-xs font-extrabold text-[var(--color-primary)]">
          {eyebrow}
        </p>
      </div>
      <div className="text-center">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
          {title}
        </h1>
        <span className="mx-auto mt-3 block h-0.5 w-16 rounded-sm bg-[var(--color-primary)]" />
      </div>
      <div className="flex justify-start md:justify-end">{children}</div>
    </section>
  );
}

export function Feedback({ error, success }: Readonly<SearchFeedback>) {
  return <FeedbackToast error={error} success={success} />;
}

export function Panel({
  title,
  children,
}: Readonly<{
  title: string;
  children: React.ReactNode;
}>) {
  return (
    <section className="glass-panel overflow-hidden rounded-lg">
      <div className="border-b border-[var(--color-border)] px-5 py-4">
        <h2 className="font-display text-lg font-extrabold tracking-tight text-[var(--color-text-primary)]">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function EmptyState({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--color-border-strong)] bg-[rgba(15,23,42,0.48)] px-5 py-8 text-center text-sm font-semibold text-[var(--color-text-muted)]">
      <span className="mx-auto mb-3 block h-0.5 w-14 rounded-sm bg-[var(--color-primary)] opacity-70" />
      <p>{children}</p>
    </div>
  );
}

export function Field({
  children,
  label,
}: Readonly<{
  children: React.ReactNode;
  label: string;
}>) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="mono-label font-extrabold text-[var(--color-text-soft)]">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "min-h-11 rounded-md border border-[var(--color-border)] bg-[rgba(2,6,23,0.72)] px-3 py-2 text-sm font-semibold text-[var(--color-text-primary)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary-border)] focus:bg-[rgba(6,14,32,0.95)] focus:ring-4 focus:ring-[rgba(34,211,238,0.1)] [&_option]:bg-[#060e20] [&_option]:text-[var(--color-text-primary)]";

export const buttonClass =
  "inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--color-primary-border)] bg-[var(--color-primary)] px-5 py-2 text-sm font-extrabold text-[#001f25] transition-all hover:-translate-y-0.5 hover:bg-[var(--color-primary-soft)] hover:shadow-[0_18px_36px_rgba(34,211,238,0.18)] active:scale-95";

export const dangerButtonClass =
  "inline-flex min-h-10 items-center justify-center rounded-md border border-[rgba(244,63,94,0.34)] bg-[var(--color-secondary-muted)] px-4 py-2 text-sm font-extrabold text-[var(--color-secondary-soft)] transition-all hover:-translate-y-0.5 hover:border-[var(--color-secondary)] hover:bg-[rgba(244,63,94,0.18)] hover:shadow-[0_14px_28px_rgba(244,63,94,0.12)] active:scale-95";

export const ghostButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--color-border)] bg-[rgba(19,27,46,0.72)] px-4 py-2 text-sm font-extrabold text-[var(--color-text-secondary)] transition hover:-translate-y-0.5 hover:border-[var(--color-primary-border)] hover:bg-[var(--color-primary-muted)] hover:text-[var(--color-primary-soft)] hover:shadow-[0_12px_24px_rgba(34,211,238,0.1)]";

export function DashboardLink({
  children,
  href,
}: Readonly<{
  children: React.ReactNode;
  href: string;
}>) {
  return (
    <Link className={ghostButtonClass} href={href}>
      {children}
    </Link>
  );
}

export function StatusBadge({ children }: Readonly<{ children: React.ReactNode }>) {
  const value = String(children).toLowerCase();
  const labelByStatus: Record<string, string> = {
    admin: "Admin",
    active: "Activa",
    archived: "Archivada",
    designer: "Diseno",
    draft: "Pendiente de Carga",
    inactive: "Inactiva",
    incident: "Pantalla con incidente",
    maintenance: "Mantenimiento",
    manager: "Manager",
    ok: "OK",
    operator: "Operador",
    remodeling: "Remodelacion",
    super_admin: "Super usuario",
    user: "Consultor",
    viewer: "Consulta",
  };
  const isGood = value === "ok" || value === "active" || value === "super_admin";
  const isManager = value === "manager";
  const isWarning = value === "remodeling" || value === "maintenance";
  const isPending = value === "draft";
  const isDanger = value === "incident" || value === "archived" || value === "inactive";
  const color = isGood
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
    <span className={`inline-flex min-w-24 items-center justify-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-xs font-extrabold ${color}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {labelByStatus[value] ?? children}
    </span>
  );
}
