import type { ReactNode } from "react";

type ListingHeaderProps = {
  action?: ReactNode;
  count: number;
  icon: "campaigns" | "locations";
  metricLabel: string;
  title: string;
};

type ActionTone = "delete" | "edit" | "view";

const actionToneClass: Record<ActionTone, string> = {
  delete: "border-red-100 bg-red-50 text-red-600 shadow-red-950/5 hover:border-red-200 hover:bg-red-100 theme-dark:border-red-900/50 theme-dark:bg-red-950/40 theme-dark:text-red-300 theme-dark:hover:bg-red-950/70",
  edit: "border-orange-100 bg-orange-50 text-orange-500 shadow-orange-950/5 hover:border-orange-200 hover:bg-orange-100 theme-dark:border-orange-900/50 theme-dark:bg-orange-950/35 theme-dark:text-orange-300 theme-dark:hover:bg-orange-950/60",
  view: "border-blue-100 bg-blue-50 text-blue-500 shadow-blue-950/5 hover:border-blue-200 hover:bg-blue-100 theme-dark:border-blue-900/50 theme-dark:bg-blue-950/35 theme-dark:text-blue-300 theme-dark:hover:bg-blue-950/60",
};

export function ListingHeader({
  action,
  count,
  icon,
  metricLabel,
  title,
}: Readonly<ListingHeaderProps>) {
  return (
    <header className="grid items-center gap-5 md:grid-cols-[1fr_auto_1fr]">
      <div className="flex items-center gap-4">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-red-50 text-red-600 shadow-[0_16px_40px_rgba(220,38,38,0.08)] theme-dark:bg-red-950/40 theme-dark:text-red-300">
          <MetricIcon icon={icon} />
        </span>
        <p className="text-xl font-extrabold tracking-tight text-red-600">
          {metricLabel}: {count}
        </p>
      </div>

      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 theme-dark:text-slate-100">
          {title}
        </h1>
        <span className="mx-auto mt-4 block h-1 w-20 rounded-full bg-red-600 shadow-[0_5px_16px_rgba(220,38,38,0.35)]" />
      </div>

      <div className="flex justify-start md:justify-end">{action}</div>
    </header>
  );
}

export function ListingPrimaryAction({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <span className="inline-flex min-h-14 items-center justify-center rounded-md bg-red-600 px-7 py-3 text-base font-extrabold text-white shadow-[0_18px_36px_rgba(220,38,38,0.2)] transition hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-[0_22px_42px_rgba(220,38,38,0.25)] theme-dark:bg-red-500 theme-dark:hover:bg-red-400">
      {children}
    </span>
  );
}

export function ListingTableShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-100 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.10)] theme-dark:border-slate-800 theme-dark:bg-slate-900 theme-dark:shadow-[0_24px_70px_rgba(0,0,0,0.30)]">
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}

export const listingTableClass =
  "w-full min-w-[900px] border-collapse text-left text-base text-slate-700 theme-dark:text-slate-200";

export const listingHeadClass =
  "border-b border-slate-200 bg-white text-sm font-extrabold text-slate-600 theme-dark:border-slate-800 theme-dark:bg-slate-900 theme-dark:text-slate-400";

export const listingHeaderCellClass = "px-7 py-6";

export const listingRowClass =
  "border-b border-slate-100 last:border-b-0 transition hover:bg-slate-50/70 theme-dark:border-slate-800 theme-dark:hover:bg-slate-800/70";

export const listingCellClass = "px-7 py-6 align-middle";

export const listingActionCellClass = "px-7 py-5 align-middle";

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
    ? "border-emerald-100 bg-emerald-50 text-emerald-600 theme-dark:border-emerald-900/50 theme-dark:bg-emerald-950/35 theme-dark:text-emerald-300"
    : isWarning
      ? "border-orange-100 bg-orange-50 text-orange-500 theme-dark:border-orange-900/50 theme-dark:bg-orange-950/35 theme-dark:text-orange-300"
      : isDanger
        ? "border-red-100 bg-red-50 text-red-600 theme-dark:border-red-900/50 theme-dark:bg-red-950/35 theme-dark:text-red-300"
        : "border-slate-100 bg-slate-50 text-slate-500 theme-dark:border-slate-700 theme-dark:bg-slate-800 theme-dark:text-slate-300";

  return (
    <span className={`inline-flex min-w-36 items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-base font-bold ${tone}`}>
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
    <span className={`inline-grid h-12 w-12 place-items-center rounded-md border shadow-sm transition hover:-translate-y-0.5 ${actionToneClass[tone]}`} title={label}>
      <span className="sr-only">{label}</span>
      <ActionGlyph tone={tone} />
    </span>
  );
}

export function DeleteActionButton({ label = "Eliminar" }: Readonly<{ label?: string }>) {
  return (
    <button
      className={`inline-grid h-12 w-12 place-items-center rounded-md border shadow-sm transition hover:-translate-y-0.5 ${actionToneClass.delete}`}
      title={label}
    >
      <span className="sr-only">{label}</span>
      <ActionGlyph tone="delete" />
    </button>
  );
}

function MetricIcon({ icon }: Readonly<{ icon: "campaigns" | "locations" }>) {
  if (icon === "locations") {
    return (
      <svg aria-hidden="true" className="h-7 w-7" fill="none" viewBox="0 0 24 24">
        <path d="M5 10h14v9H5v-9Z" stroke="currentColor" strokeWidth="2.2" />
        <path d="M3.8 10 6 5h12l2.2 5H3.8Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2.2" />
        <path d="M8 19v-5h8v5M8 7h8" stroke="currentColor" strokeWidth="2.2" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="h-7 w-7" fill="none" viewBox="0 0 24 24">
      <path d="M6 19V9M12 19V5M18 19v-7" stroke="currentColor" strokeLinecap="round" strokeWidth="2.6" />
    </svg>
  );
}

function StatusIcon({ tone }: Readonly<{ tone: "danger" | "good" | "neutral" | "warning" }>) {
  if (tone === "good") {
    return (
      <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
        <path d="m7 12 3 3 7-7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }

  if (tone === "warning") {
    return (
      <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M12 7v5l3 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
      </svg>
    );
  }

  if (tone === "danger") {
    return (
      <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M12 7v6M12 17h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="2.4" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M9 12h6" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
    </svg>
  );
}

function ActionGlyph({ tone }: Readonly<{ tone: ActionTone }>) {
  if (tone === "view") {
    return (
      <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path d="M3.5 12s3-5.5 8.5-5.5 8.5 5.5 8.5 5.5-3 5.5-8.5 5.5S3.5 12 3.5 12Z" stroke="currentColor" strokeWidth="2.2" />
        <path d="M12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" stroke="currentColor" strokeWidth="2.2" />
      </svg>
    );
  }

  if (tone === "edit") {
    return (
      <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path d="M4 16.8V20h3.2L18.7 8.5l-3.2-3.2L4 16.8Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2.2" />
        <path d="m14.7 6.1 3.2 3.2" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
      <path d="M5 7h14M10 11v6M14 11v6M8 7l.6 12h6.8L16 7M9.5 7l.8-2h3.4l.8 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
    </svg>
  );
}
