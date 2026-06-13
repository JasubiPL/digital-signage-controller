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
    <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-600">
          {eyebrow}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">
          {title}
        </h1>
      </div>
      {children}
    </section>
  );
}

export function Feedback({ error, success }: Readonly<SearchFeedback>) {
  if (!error && !success) return null;

  const tone = error
    ? "border-red-200 bg-red-50 text-red-950"
    : "border-emerald-200 bg-emerald-50 text-emerald-950";

  return (
    <div className={`rounded border px-4 py-3 text-sm ${tone}`}>
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
    <section className="bg-white">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-xl font-semibold text-red-600">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function EmptyState({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-zinc-600">
      {children}
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
    <label className="grid gap-1 text-sm">
      <span className="font-medium text-zinc-700">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "min-h-10 border-b-2 border-red-600 bg-white px-2 py-2 text-sm text-zinc-950 outline-none focus:bg-red-50";

export const buttonClass =
  "inline-flex min-h-10 items-center justify-center bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-red-400 active:scale-95";

export const dangerButtonClass =
  "inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium text-red-600 transition-all hover:scale-105 hover:bg-red-50 active:scale-95";

export const ghostButtonClass =
  "inline-flex min-h-10 items-center justify-center bg-gray-200 px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-red-600 hover:text-white";

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
    active: "Activa",
    archived: "Archivada",
    draft: "Borrador",
    inactive: "Inactiva",
    incident: "Pantalla con incidente",
    ok: "OK",
    remodeling: "Remodelacion",
    super_admin: "Super usuario",
    user: "Usuario consulta",
  };
  const color =
    value === "ok" || value === "active"
      ? "bg-lime-500 text-white"
      : value === "remodeling" || value === "draft"
        ? "bg-orange-400 text-white"
        : value === "incident" || value === "archived" || value === "inactive"
          ? "bg-red-600 text-white"
          : "bg-sky-400 text-white";

  return (
    <span className={`inline-flex px-5 py-1 text-xs font-medium ${color}`}>
      {labelByStatus[value] ?? children}
    </span>
  );
}
