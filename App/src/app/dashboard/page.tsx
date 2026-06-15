import { redirect } from "next/navigation";
import {
  FiAlertTriangle,
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiHardDrive,
  FiMonitor,
  FiRadio,
  FiUsers,
} from "react-icons/fi";

import { bootstrapFirstAdmin } from "@/server/auth/bootstrap";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/server/supabase/admin";
import { supabaseServerEnv } from "@/server/supabase/env";
import {
  ensureProfile,
  getBootstrapState,
  getUserCompanyAccess,
  requireUser,
} from "@/server/auth/session";

import { buttonClass, Feedback, PageHeader } from "./components";
import { SubmitButton } from "./submit-button";

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

  if (!access.isGlobalAdmin) {
    const firstCompany = access.data.find((item) => item.companies)?.companies;

    if (firstCompany) {
      redirect(`/dashboard/locations/${firstCompany.slug}`);
    }

    redirect("/dashboard/locations");
  }

  const companyIds = access.data
    .map((item) => item.companies?.id)
    .filter((id): id is string => Boolean(id));
  const adminClient = supabaseServerEnv.hasSecretKey ? createAdminClient() : null;
  const incidentCountByStatus = (status: string) =>
    companyIds.length
      ? supabase
          .from("location_incidents")
          .select("id", { count: "exact", head: true })
          .in("company_id", companyIds)
          .eq("status", status)
      : Promise.resolve({ count: 0 });
  const [
    { count: campaignCount },
    { count: locationCount },
    { count: screenCount },
    { count: mediaCount },
    { count: openIncidentCount },
    { count: inProgressIncidentCount },
    { count: resolvedIncidentCount },
    { count: userCount },
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
    incidentCountByStatus("open"),
    incidentCountByStatus("in_progress"),
    incidentCountByStatus("resolved"),
    (adminClient ?? supabase).from("profiles").select("id", { count: "exact", head: true }),
  ]);

  return (
    <div className="mx-auto flex h-full w-full flex-col gap-6">
      <PageHeader eyebrow="Dashboard" title="Panel privado">
      </PageHeader>

      <Feedback error={error} />

      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard
          helper="Activas y pendientes"
          icon={<FiRadio aria-hidden="true" />}
          label="Campañas"
          value={campaignCount ?? 0}
        />
        <MetricCard
          helper="Taquillas/puntos"
          icon={<FiBriefcase aria-hidden="true" />}
          label="Taquillas"
          value={locationCount ?? 0}
        />
        <MetricCard
          helper="Players y pantallas"
          icon={<FiMonitor aria-hidden="true" />}
          label="Pantallas"
          value={screenCount ?? 0}
        />
        <MetricCard
          helper="Storage privado"
          icon={<FiHardDrive aria-hidden="true" />}
          label="Archivos"
          value={mediaCount ?? 0}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard
          helper="Incidentes pendientes"
          icon={<FiAlertTriangle aria-hidden="true" />}
          label="Abiertos"
          value={openIncidentCount ?? 0}
        />
        <MetricCard
          helper="Incidentes en atencion"
          icon={<FiClock aria-hidden="true" />}
          label="En proceso"
          value={inProgressIncidentCount ?? 0}
        />
        <MetricCard
          helper="Incidentes cerrados"
          icon={<FiCheckCircle aria-hidden="true" />}
          label="Resueltos"
          value={resolvedIncidentCount ?? 0}
        />
        <MetricCard
          helper="Cuentas registradas"
          icon={<FiUsers aria-hidden="true" />}
          label="Usuarios"
          value={userCount ?? 0}
        />
      </section>

      {!profile.ok ? (
        <StateCard tone="error" title="Usuario autenticado sin perfil">
          No se pudo crear o actualizar tu perfil: {profile.message}
        </StateCard>
      ) : null}

      {profile.ok && bootstrap.companyCount === 0 ? (
        <StateCard title="No hay compañías configuradas">
          El schema esta aplicado, pero falta ejecutar o verificar el seed de
          compañías antes de asignar permisos.
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
            super usuario de todas las compañías.
          </p>
          <form action={bootstrapFirstAdmin} className="mt-4">
            <SubmitButton className={buttonClass} pendingLabel="Creando...">
              Crear primer super usuario
            </SubmitButton>
          </form>
        </StateCard>
      ) : null}

      {profile.ok &&
      !access.error &&
      access.data.length === 0 &&
      !bootstrap.canBootstrap &&
      bootstrap.companyCount > 0 ? (
        <StateCard title="Usuario autenticado sin compañía">
          Tu perfil existe, pero todavia no tienes permisos asignados en ninguna
          compañía ni rol global.
        </StateCard>
      ) : null}

    </div>
  );
}

function MetricCard({
  helper,
  icon,
  label,
  value,
}: Readonly<{
  helper: string;
  icon: React.ReactNode;
  label: string;
  value: number;
}>) {
  return (
    <article className="glass-panel group relative min-h-32 overflow-hidden rounded-lg px-5 py-4 transition hover:border-[var(--color-primary-border)] hover:bg-[rgba(34,211,238,0.055)]">
      <div className="absolute right-4 top-4 text-6xl text-[rgba(148,163,184,0.08)] transition group-hover:text-[rgba(34,211,238,0.1)]">
        {icon}
      </div>
      <p className="mono-label relative text-sm font-extrabold text-[var(--color-primary)]">{label}</p>
      <div className="relative mt-3 flex items-end justify-between gap-3">
        <p className="font-display text-5xl font-extrabold tracking-tight text-[var(--color-text-primary)]">{value}</p>
        <p className="max-w-24 pb-1.5 text-right text-xs font-semibold leading-5 text-[var(--color-text-muted)]">{helper}</p>
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
      ? "border-[rgba(244,63,94,0.34)] bg-[var(--color-secondary-muted)] text-[var(--color-secondary-soft)]"
      : "border-[var(--color-border)] bg-[rgba(15,23,42,0.64)] text-[var(--color-text-primary)]";

  return (
    <section className={`rounded-lg border p-6 ${styles}`}>
      <h2 className="font-display text-lg font-extrabold">{title}</h2>
      <div className="mt-3 text-sm font-semibold leading-6 text-[var(--color-text-soft)]">{children}</div>
    </section>
  );
}
