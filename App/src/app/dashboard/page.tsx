import { bootstrapFirstAdmin } from "@/server/auth/bootstrap";
import { createClient } from "@/lib/supabase/server";
import {
  ensureProfile,
  getBootstrapState,
  getUserCompanyAccess,
  requireUser,
} from "@/server/auth/session";

import { DashboardLink, Feedback, PageHeader, StatusBadge } from "./components";

type DashboardPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const [{ error }, user] = await Promise.all([
    searchParams,
    requireUser("/dashboard"),
  ]);
  const profile = await ensureProfile(user);
  const supabase = await createClient();
  const [access, bootstrap] = await Promise.all([
    getUserCompanyAccess(user.id),
    getBootstrapState(),
  ]);
  const companyIds = access.data
    .map((item) => item.companies?.id)
    .filter((id): id is string => Boolean(id));
  const [
    { count: campaignCount },
    { count: locationCount },
    { count: screenCount },
    { count: mediaCount },
  ] = await Promise.all([
    companyIds.length
      ? supabase.from("campaigns").select("id", { count: "exact", head: true }).in("company_id", companyIds)
      : Promise.resolve({ count: 0 }),
    companyIds.length
      ? supabase.from("locations").select("id", { count: "exact", head: true }).in("company_id", companyIds)
      : Promise.resolve({ count: 0 }),
    companyIds.length
      ? supabase.from("screens").select("id", { count: "exact", head: true }).in("company_id", companyIds)
      : Promise.resolve({ count: 0 }),
    companyIds.length
      ? supabase
          .from("media_files")
          .select("id", { count: "exact", head: true })
          .in("company_id", companyIds)
          .eq("status", "active")
      : Promise.resolve({ count: 0 }),
  ]);

  return (
    <div className="mx-auto flex h-full w-full flex-col gap-8">
      <PageHeader eyebrow="Dashboard" title="Panel privado">
        <div className="flex gap-2">
          <DashboardLink href="/dashboard/campaigns">Campanas</DashboardLink>
          <DashboardLink href="/dashboard/files">Archivos</DashboardLink>
        </div>
      </PageHeader>

      <Feedback error={error} />

      <section className="grid gap-5 md:grid-cols-4">
        <MetricCard helper="Activas y pendientes" label="Campanas" value={campaignCount ?? 0} />
        <MetricCard helper="Taquillas/puntos" label="Taquillas" value={locationCount ?? 0} />
        <MetricCard helper="Players y pantallas" label="Pantallas" value={screenCount ?? 0} />
        <MetricCard helper="Storage privado" label="Archivos" value={mediaCount ?? 0} />
      </section>

      {!profile.ok ? (
        <StateCard tone="error" title="Usuario autenticado sin perfil">
          No se pudo crear o actualizar tu perfil: {profile.message}
        </StateCard>
      ) : null}

      {profile.ok && bootstrap.companyCount === 0 ? (
        <StateCard title="No hay companias configuradas">
          El schema esta aplicado, pero falta ejecutar o verificar el seed de
          companias antes de asignar permisos.
        </StateCard>
      ) : null}

      {profile.ok && access.error ? (
        <StateCard tone="error" title="No se pudieron leer permisos">
          {access.error}
        </StateCard>
      ) : null}

      {profile.ok && !access.error && access.data.length === 0 && bootstrap.canBootstrap ? (
        <StateCard title="Bootstrap del primer super usuario">
          <p>
            No existe ningun super usuario. Puedes convertir este usuario en
            super usuario de todas las companias.
          </p>
          <form action={bootstrapFirstAdmin} className="mt-4">
            <button className="inline-flex min-h-12 items-center justify-center rounded-md bg-red-600 px-6 py-2.5 text-sm font-extrabold text-white shadow-[0_18px_36px_rgba(220,38,38,0.20)] transition-all hover:-translate-y-0.5 hover:bg-red-700">
              Crear primer super usuario
            </button>
          </form>
        </StateCard>
      ) : null}

      {profile.ok &&
      !access.error &&
      access.data.length === 0 &&
      !bootstrap.canBootstrap &&
      bootstrap.companyCount > 0 ? (
        <StateCard title="Usuario autenticado sin compania">
          Tu perfil existe, pero todavia no tienes permisos asignados en ninguna
          compania ni rol global.
        </StateCard>
      ) : null}

      {profile.ok && access.isGlobalAdmin ? (
        <StateCard title="Super usuario">
          Este usuario tiene acceso administrativo a todas las companias activas.
        </StateCard>
      ) : null}

      {profile.ok && access.data.length > 0 ? (
        <section className="grid gap-4">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 theme-dark:text-slate-100">
            Companias disponibles
          </h2>
          <section className="grid gap-4 md:grid-cols-2">
            {access.data.map((item) => (
              <article
                className="rounded-lg border border-slate-100 bg-white p-5 shadow-[0_18px_42px_rgba(15,23,42,0.06)] theme-dark:border-slate-800 theme-dark:bg-slate-900"
                key={`${item.companies?.id}-${item.role}`}
              >
                <StatusBadge>{item.role}</StatusBadge>
                <h2 className="mt-4 text-lg font-extrabold text-slate-800 theme-dark:text-slate-100">
                  {item.companies?.name ?? "Compania sin nombre"}
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-500 theme-dark:text-slate-400">
                  Slug: {item.companies?.slug ?? "sin-slug"}
                </p>
              </article>
            ))}
          </section>
        </section>
      ) : null}
    </div>
  );
}

function MetricCard({
  helper,
  label,
  value,
}: Readonly<{
  helper: string;
  label: string;
  value: number;
}>) {
  return (
    <article className="rounded-lg border border-slate-100 bg-white px-7 py-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] theme-dark:border-slate-800 theme-dark:bg-slate-900 theme-dark:shadow-[0_24px_70px_rgba(0,0,0,0.30)]">
      <p className="text-lg font-extrabold text-red-600">{label}</p>
      <div className="mt-4 flex items-end justify-between gap-4">
        <p className="text-6xl font-extrabold tracking-tight text-slate-900 theme-dark:text-slate-100">{value}</p>
        <p className="max-w-28 pb-2 text-right text-sm font-semibold leading-5 text-slate-500 theme-dark:text-slate-400">{helper}</p>
      </div>
    </article>
  );
}

function StateCard({
  children,
  title,
  tone = "default",
}: Readonly<{
  children: React.ReactNode;
  title: string;
  tone?: "default" | "error";
}>) {
  const styles =
    tone === "error"
      ? "border-red-100 bg-red-50 text-red-950 theme-dark:border-red-900/50 theme-dark:bg-red-950/35 theme-dark:text-red-200"
      : "border-slate-100 bg-white text-slate-800 theme-dark:border-slate-800 theme-dark:bg-slate-900 theme-dark:text-slate-100";

  return (
    <section className={`rounded-lg border p-6 shadow-[0_18px_42px_rgba(15,23,42,0.06)] ${styles}`}>
      <h2 className="text-lg font-extrabold">{title}</h2>
      <div className="mt-3 text-sm font-semibold leading-6 text-slate-600 theme-dark:text-slate-300">{children}</div>
    </section>
  );
}
