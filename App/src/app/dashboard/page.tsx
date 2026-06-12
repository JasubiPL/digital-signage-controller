import { bootstrapFirstAdmin } from "@/server/auth/bootstrap";
import {
  ensureProfile,
  getBootstrapState,
  getUserCompanyAccess,
  requireUser,
} from "@/server/auth/session";

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
  const [access, bootstrap] = await Promise.all([
    getUserCompanyAccess(user.id),
    getBootstrapState(),
  ]);

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-700">
          Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Panel privado
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
          Esta pantalla ya usa sesion real de Supabase Auth y crea el perfil
          local del usuario cuando hace falta.
        </p>
      </section>

      {error ? (
        <StateCard tone="error" title="Accion no completada">
          {error}
        </StateCard>
      ) : null}

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
        <StateCard title="Bootstrap del primer admin">
          <p>
            No existe ningun `super_admin`. Puedes convertir este usuario en
            admin global de todas las companias.
          </p>
          <form action={bootstrapFirstAdmin} className="mt-4">
            <button className="rounded bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800">
              Crear primer admin
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
        <StateCard title="Admin global">
          Este usuario tiene acceso administrativo a todas las companias activas.
        </StateCard>
      ) : null}

      {profile.ok && access.data.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-2">
          {access.data.map((item) => (
            <article
              className="rounded border border-zinc-200 bg-white p-5 shadow-sm"
              key={`${item.companies?.id}-${item.role}`}
            >
              <p className="text-sm font-medium uppercase tracking-[0.14em] text-zinc-500">
                {item.role}
              </p>
              <h2 className="mt-2 text-xl font-semibold">
                {item.companies?.name ?? "Compania sin nombre"}
              </h2>
              <p className="mt-2 text-sm text-zinc-600">
                Slug: {item.companies?.slug ?? "sin-slug"}
              </p>
            </article>
          ))}
        </section>
      ) : null}
    </div>
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
