import { bootstrapFirstAdmin } from "@/server/auth/bootstrap";
import { createClient } from "@/lib/supabase/server";
import {
  ensureProfile,
  getBootstrapState,
  getUserCompanyAccess,
  requireUser,
} from "@/server/auth/session";

import { DashboardLink, Feedback, PageHeader, Panel, StatusBadge } from "./components";

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
    <div className="mx-auto flex h-full w-[95%] flex-col gap-6">
      <PageHeader eyebrow="Dashboard" title="Panel privado">
        <div className="flex gap-2">
          <DashboardLink href="/dashboard/campaigns">Campanas</DashboardLink>
          <DashboardLink href="/dashboard/files">Archivos</DashboardLink>
        </div>
      </PageHeader>

      <Feedback error={error} />

      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard helper="Activas y borrador" label="Campanas" value={campaignCount ?? 0} />
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
            <button className="rounded bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800">
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
        <Panel title="Companias disponibles">
          <section className="grid gap-4 md:grid-cols-2">
            {access.data.map((item) => (
              <article
                className="rounded border border-zinc-200 bg-white p-4"
                key={`${item.companies?.id}-${item.role}`}
              >
                <StatusBadge>{item.role}</StatusBadge>
                <h2 className="mt-3 text-lg font-semibold">
                  {item.companies?.name ?? "Compania sin nombre"}
                </h2>
                <p className="mt-1 text-sm text-zinc-600">
                  Slug: {item.companies?.slug ?? "sin-slug"}
                </p>
              </article>
            ))}
          </section>
        </Panel>
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
    <article className="bg-white px-8 py-4">
      <p className="text-xl text-red-600">{label}</p>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-6xl font-semibold text-zinc-950">{value}</p>
        <p className="max-w-24 text-right text-sm text-zinc-500">{helper}</p>
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
      ? "border-red-200 bg-red-50 text-red-950"
      : "border-zinc-200 bg-white text-zinc-950";

  return (
    <section className={`rounded border p-5 shadow-sm ${styles}`}>
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-2 text-sm leading-6">{children}</div>
    </section>
  );
}
