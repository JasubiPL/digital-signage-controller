import Link from "next/link";

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
    <section className="grid items-center gap-5 md:grid-cols-[1fr_auto_1fr]">
      <div>
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-red-600">
          {eyebrow}
        </p>
      </div>
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 theme-dark:text-slate-100">
          {title}
        </h1>
        <span className="mx-auto mt-4 block h-1 w-20 rounded-full bg-red-600 shadow-[0_5px_16px_rgba(220,38,38,0.35)]" />
      </div>
      <div className="flex justify-start md:justify-end">{children}</div>
    </section>
  );
}

export function Feedback({ error, success }: Readonly<SearchFeedback>) {
  if (!error && !success) return null;

  const tone = error
    ? "border-red-100 bg-red-50 text-red-950 theme-dark:border-red-900/50 theme-dark:bg-red-950/35 theme-dark:text-red-200"
    : "border-emerald-100 bg-emerald-50 text-emerald-950 theme-dark:border-emerald-900/50 theme-dark:bg-emerald-950/35 theme-dark:text-emerald-200";

  return (
    <div className={`rounded-lg border px-5 py-4 text-sm font-semibold shadow-[0_18px_42px_rgba(15,23,42,0.06)] ${tone}`}>
      {error ?? success}
    </div>
  );
}

export function Panel({
  title,
  children,
}: Readonly<{
  title: string;
  children: React.ReactNode;
}>) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-100 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.10)] theme-dark:border-slate-800 theme-dark:bg-slate-900 theme-dark:shadow-[0_24px_70px_rgba(0,0,0,0.30)]">
      <div className="border-b border-slate-100 px-7 py-5 theme-dark:border-slate-800">
        <h2 className="text-xl font-extrabold tracking-tight text-slate-800 theme-dark:text-slate-100">{title}</h2>
      </div>
      <div className="p-7">{children}</div>
    </section>
  );
}

export function EmptyState({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-white/70 px-6 py-10 text-center text-sm font-semibold text-slate-500 shadow-[0_18px_42px_rgba(15,23,42,0.04)] theme-dark:border-slate-700 theme-dark:bg-slate-900/70 theme-dark:text-slate-400">
      <span className="mx-auto mb-4 block h-1 w-16 rounded-full bg-red-100 theme-dark:bg-red-900/60" />
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
      <span className="font-extrabold text-slate-600 theme-dark:text-slate-300">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "min-h-12 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm outline-none transition focus:border-red-200 focus:bg-red-50/40 focus:ring-4 focus:ring-red-100 theme-dark:border-slate-700 theme-dark:bg-slate-950 theme-dark:text-slate-100 theme-dark:focus:border-red-800 theme-dark:focus:bg-red-950/20 theme-dark:focus:ring-red-950/50";

export const buttonClass =
  "inline-flex min-h-12 items-center justify-center rounded-md bg-red-600 px-6 py-2.5 text-sm font-extrabold text-white shadow-[0_18px_36px_rgba(220,38,38,0.20)] transition-all hover:-translate-y-0.5 hover:bg-red-700 active:scale-95 theme-dark:bg-red-500 theme-dark:hover:bg-red-400";

export const dangerButtonClass =
  "inline-flex min-h-10 items-center justify-center rounded-md border border-red-100 bg-red-50 px-4 py-2 text-sm font-extrabold text-red-600 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-red-100 active:scale-95 theme-dark:border-red-900/50 theme-dark:bg-red-950/35 theme-dark:text-red-300 theme-dark:hover:bg-red-950/60";

export const ghostButtonClass =
  "inline-flex min-h-12 items-center justify-center rounded-md border border-slate-200 bg-white px-5 py-2 text-sm font-extrabold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-red-100 hover:bg-red-50 hover:text-red-600 theme-dark:border-slate-700 theme-dark:bg-slate-900 theme-dark:text-slate-200 theme-dark:hover:border-red-900/60 theme-dark:hover:bg-red-950/30 theme-dark:hover:text-red-300";

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
    ok: "OK",
    operator: "Operador",
    remodeling: "Remodelacion",
    super_admin: "Super usuario",
    user: "Usuario consulta",
    viewer: "Consulta",
  };
  const isGood = value === "ok" || value === "active" || value === "super_admin";
  const isWarning = value === "remodeling" || value === "draft" || value === "maintenance";
  const isDanger = value === "incident" || value === "archived" || value === "inactive";
  const color = isGood
    ? "border-emerald-100 bg-emerald-50 text-emerald-600 theme-dark:border-emerald-900/50 theme-dark:bg-emerald-950/35 theme-dark:text-emerald-300"
    : isWarning
      ? "border-orange-100 bg-orange-50 text-orange-500 theme-dark:border-orange-900/50 theme-dark:bg-orange-950/35 theme-dark:text-orange-300"
      : isDanger
        ? "border-red-100 bg-red-50 text-red-600 theme-dark:border-red-900/50 theme-dark:bg-red-950/35 theme-dark:text-red-300"
        : "border-blue-100 bg-blue-50 text-blue-500 theme-dark:border-blue-900/50 theme-dark:bg-blue-950/35 theme-dark:text-blue-300";

  return (
    <span className={`inline-flex min-w-28 items-center justify-center rounded-md border px-4 py-2 text-xs font-extrabold ${color}`}>
      {labelByStatus[value] ?? children}
    </span>
  );
}
