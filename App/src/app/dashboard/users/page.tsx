import Image from "next/image";
import { notFound } from "next/navigation";

import {
  createManagedUser,
  deleteManagedUser,
  updateManagedUser,
} from "@/app/dashboard/actions";
import { createAdminClient } from "@/server/supabase/admin";
import { supabaseServerEnv } from "@/server/supabase/env";

import {
  buttonClass,
  dangerButtonClass,
  EmptyState,
  Feedback,
  Field,
  inputClass,
  PageHeader,
} from "../components";
import { getDashboardContext } from "../data";
import { DashboardDialog } from "../dialog";
import {
  ActionIconTrigger,
  ListingPrimaryAction,
  ListingStatusBadge,
  ListingTableShell,
  listingActionCellClass,
  listingCellClass,
  listingHeadClass,
  listingHeaderCellClass,
  listingRowClass,
  listingTableClass,
} from "../list-ui";
import { SubmitButton } from "../submit-button";

type UsersPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

type Profile = {
  created_at: string;
  email: string;
  full_name: string | null;
  global_role: "super_admin" | "manager" | "user";
  id: string;
};

export default async function UsersPage({ searchParams }: Readonly<UsersPageProps>) {
  const [{ error, success }, { access, user }] = await Promise.all([
    searchParams,
    getDashboardContext("/dashboard/users"),
  ]);

  if (!access.isGlobalAdmin) {
    notFound();
  }

  if (!supabaseServerEnv.hasSecretKey) {
    return (
      <div className="mx-auto flex w-full flex-col gap-6">
        <PageHeader eyebrow="Super usuario" title="Gestion de usuarios" />
        <Feedback error={error} success={success} />
        <section className="rounded-lg border border-[rgba(244,63,94,0.34)] bg-[var(--color-secondary-muted)] p-6 text-sm font-semibold leading-6 text-[var(--color-secondary-soft)]">
          Para gestionar usuarios desde la app falta configurar
          `SUPABASE_SECRET_KEY` o `SUPABASE_SERVICE_ROLE_KEY`. Esa llave es
          necesaria para crear cuentas reales en Supabase Auth y sincronizar sus
          perfiles.
        </section>
      </div>
    );
  }

  const admin = createAdminClient();
  const { data: profiles, error: profilesError } = await admin
    .from("profiles")
    .select("id, email, full_name, global_role, created_at")
    .order("email", { ascending: true });

  if (profilesError) {
    return (
      <UsersShell error={profilesError.message} success={success}>
        <EmptyState>No se pudieron leer los perfiles.</EmptyState>
      </UsersShell>
    );
  }

  const typedProfiles = (profiles ?? []) as Profile[];

  return (
    <div className="mx-auto flex w-full flex-col gap-6">
      <Feedback error={error} success={success} />

      <PageHeader eyebrow="Super usuario" title="Gestion de usuarios">
        <DashboardDialog
          title="Nuevo usuario"
          trigger={
            <ListingPrimaryAction>
              Nuevo Usuario +
            </ListingPrimaryAction>
          }
        >
          <CreateUserForm />
        </DashboardDialog>
      </PageHeader>

      <section className="grid gap-4 md:grid-cols-4">
        <UserMetric label="Usuarios" value={typedProfiles.length} />
        <UserMetric
          label="Super usuarios"
          value={typedProfiles.filter((profile) => profile.global_role === "super_admin").length}
        />
        <UserMetric
          label="Managers"
          value={typedProfiles.filter((profile) => profile.global_role === "manager").length}
        />
        <UserMetric
          label="Consultores"
          value={typedProfiles.filter((profile) => profile.global_role === "user").length}
        />
      </section>

      {!typedProfiles.length ? (
        <EmptyState>No hay usuarios disponibles para administrar.</EmptyState>
      ) : (
        <ListingTableShell>
          <table className={listingTableClass}>
            <thead className={listingHeadClass}>
              <tr>
                <th className={listingHeaderCellClass}>Usuario</th>
                <th className={listingHeaderCellClass}>Email</th>
                <th className={listingHeaderCellClass}>Rol</th>
                <th className={listingHeaderCellClass}>Alta</th>
                <th className={`${listingHeaderCellClass} text-center`}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {typedProfiles.map((profile) => (
                <tr className={listingRowClass} key={profile.id}>
                  <td className={listingCellClass}>
                    <div className="flex items-center gap-3">
                      <UserAvatar profile={profile} />
                      <span className="font-semibold text-[var(--color-text-primary)]">
                        {profile.full_name || "Sin nombre"}
                      </span>
                    </div>
                  </td>
                  <td className={listingCellClass}>{profile.email}</td>
                  <td className={listingCellClass}>
                    <ListingStatusBadge>{profile.global_role}</ListingStatusBadge>
                  </td>
                  <td className={listingCellClass}>
                    {new Date(profile.created_at).toLocaleDateString("es-MX")}
                  </td>
                  <td className={listingActionCellClass}>
                    <div className="flex items-center justify-center gap-2">
                      <DashboardDialog
                        title={`Detalle de ${profile.email}`}
                        trigger={<ActionIconTrigger label="Ver" tone="view" />}
                      >
                        <ViewUserDetails profile={profile} />
                      </DashboardDialog>
                      <DashboardDialog
                        title={`Modificar ${profile.email}`}
                        trigger={<ActionIconTrigger label="Modificar" tone="edit" />}
                      >
                        <EditUserForm currentUserId={user.id} profile={profile} />
                      </DashboardDialog>
                      <DashboardDialog
                        title={`Eliminar ${profile.email}`}
                        trigger={<ActionIconTrigger label="Eliminar" tone="delete" />}
                      >
                        <DeleteUserForm currentUserId={user.id} profile={profile} />
                      </DashboardDialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ListingTableShell>
      )}
    </div>
  );
}

function UserAvatar({ profile }: Readonly<{ profile: Profile }>) {
  const displayName = profile.full_name || profile.email;

  return (
    <span className="relative grid h-10 w-10 flex-none place-items-center overflow-hidden rounded-full border border-[var(--color-primary-border)] bg-[var(--color-primary-muted)]">
      <Image
        alt={`Avatar de ${displayName}`}
        className="h-full w-full object-cover"
        height={40}
        priority={false}
        src={avatarSrcForProfile(profile)}
        width={40}
      />
    </span>
  );
}

function avatarSrcForProfile(profile: Profile) {
  if (profile.global_role === "super_admin") {
    return "/default-avatar/admin.png";
  }

  if (profile.global_role === "manager") {
    return "/default-avatar/manager.png";
  }

  return "/default-avatar/consultant.png";
}

function UsersShell({
  children,
  error,
  success,
}: Readonly<{
  children: React.ReactNode;
  error?: string;
  success?: string;
}>) {
  return (
    <div className="mx-auto flex w-full flex-col gap-6">
      <PageHeader eyebrow="Super usuario" title="Gestion de usuarios" />
      <Feedback error={error} success={success} />
      {children}
    </div>
  );
}

function CreateUserForm() {
  return (
    <form action={createManagedUser} className="grid gap-4">
      <input name="returnPath" type="hidden" value="/dashboard/users" />
      <Field label="Nombre">
        <input className={inputClass} name="fullName" placeholder="Nombre completo" />
      </Field>
      <Field label="Email">
        <input
          className={inputClass}
          name="email"
          placeholder="usuario@empresa.com"
          required
          type="email"
        />
      </Field>
      <Field label="Contrasena temporal">
        <input className={inputClass} minLength={8} name="password" required type="password" />
      </Field>
      <RoleField defaultValue="user" />
      <SubmitButton className={buttonClass} pendingLabel="Creando...">
        Crear usuario
      </SubmitButton>
    </form>
  );
}

function EditUserForm({
  currentUserId,
  profile,
}: Readonly<{
  currentUserId: string;
  profile: Profile;
}>) {
  const isEditingSelf = currentUserId === profile.id;

  return (
    <form action={updateManagedUser} className="grid gap-4">
      <input name="returnPath" type="hidden" value="/dashboard/users" />
      <input name="userId" type="hidden" value={profile.id} />
      <Field label="Nombre">
        <input
          className={inputClass}
          defaultValue={profile.full_name ?? ""}
          name="fullName"
          placeholder="Nombre completo"
        />
      </Field>
      <Field label="Email">
        <input
          className={inputClass}
          defaultValue={profile.email}
          name="email"
          required
          type="email"
        />
      </Field>
      <Field label="Nueva contrasena">
        <input
          autoComplete="new-password"
          className={inputClass}
          minLength={8}
          name="password"
          placeholder="Dejar en blanco para no cambiar"
          type="password"
        />
        <p className="mt-1.5 text-xs font-semibold leading-5 text-[var(--color-text-muted)]">
          Minimo 8 caracteres. Solo se actualiza si capturas un valor.
        </p>
      </Field>
      <RoleField defaultValue={profile.global_role} disabledUserOption={isEditingSelf} />
      {isEditingSelf ? (
        <p className="text-xs font-semibold leading-5 text-[var(--color-text-muted)]">
          No puedes quitarte tu propio rol de super usuario desde esta pantalla.
        </p>
      ) : null}
      <SubmitButton className={buttonClass} pendingLabel="Guardando...">
        Guardar cambios
      </SubmitButton>
    </form>
  );
}

const roleLabels: Record<Profile["global_role"], string> = {
  manager: "Manager",
  super_admin: "Super usuario",
  user: "Consultor",
};

function ViewUserDetails({ profile }: Readonly<{ profile: Profile }>) {
  const createdAt = new Date(profile.created_at).toLocaleString("es-MX", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-3">
        <UserAvatar profile={profile} />
        <div>
          <p className="font-display text-base font-extrabold text-[var(--color-text-primary)]">
            {profile.full_name || "Sin nombre"}
          </p>
          <p className="font-mono text-xs text-[var(--color-primary)]">{profile.email}</p>
        </div>
      </div>

      <dl className="grid gap-3">
        <DetailRow label="Nombre" value={profile.full_name || "Sin nombre"} />
        <DetailRow label="Email" value={profile.email} />
        <DetailRow label="Rol" value={roleLabels[profile.global_role]} />
        <DetailRow label="Alta" value={createdAt} />
        <DetailRow label="ID" value={profile.id} mono />
      </dl>

      <div className="rounded-md border border-[var(--color-border)] bg-[rgba(148,163,184,0.08)] px-4 py-3">
        <p className="mono-label text-xs text-[var(--color-text-muted)]">Contrasena</p>
        <p className="mt-1.5 font-mono text-sm tracking-[0.3em] text-[var(--color-text-soft)]">
          ••••••••
        </p>
        <p className="mt-2 text-xs font-semibold leading-5 text-[var(--color-text-muted)]">
          Por seguridad, las contrasenas se guardan cifradas y no se pueden
          mostrar. Para cambiarla usa la opcion Modificar.
        </p>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  mono = false,
  value,
}: Readonly<{
  label: string;
  mono?: boolean;
  value: string;
}>) {
  return (
    <div className="grid gap-1 border-b border-[var(--color-border)] pb-3 last:border-b-0 last:pb-0 sm:grid-cols-[8rem_1fr] sm:items-baseline">
      <dt className="mono-label text-xs text-[var(--color-text-muted)]">{label}</dt>
      <dd
        className={`text-sm font-semibold text-[var(--color-text-primary)] ${mono ? "break-all font-mono text-xs text-[var(--color-text-soft)]" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}

function DeleteUserForm({
  currentUserId,
  profile,
}: Readonly<{
  currentUserId: string;
  profile: Profile;
}>) {
  const isDeletingSelf = currentUserId === profile.id;

  return (
    <form action={deleteManagedUser} className="grid gap-4">
      <input name="returnPath" type="hidden" value="/dashboard/users" />
      <input name="userId" type="hidden" value={profile.id} />
      <p className="text-sm leading-6 text-[var(--color-text-soft)]">
        Esta accion eliminara la cuenta de Supabase Auth y su perfil asociado.
        No se puede deshacer.
      </p>
      {isDeletingSelf ? (
        <p className="rounded-md border border-[rgba(244,63,94,0.34)] bg-[var(--color-secondary-muted)] px-4 py-3 text-sm font-semibold text-[var(--color-secondary-soft)]">
          No puedes eliminar tu propia cuenta desde esta pantalla.
        </p>
      ) : null}
      {isDeletingSelf ? (
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--color-border)] bg-[rgba(148,163,184,0.12)] px-5 py-2 text-sm font-extrabold text-[var(--color-text-muted)] shadow-none disabled:cursor-not-allowed"
          disabled
          type="button"
        >
          Eliminar usuario
        </button>
      ) : (
        <SubmitButton className={dangerButtonClass} pendingLabel="Eliminando...">
          Eliminar usuario
        </SubmitButton>
      )}
    </form>
  );
}

function RoleField({
  defaultValue,
  disabledUserOption = false,
}: Readonly<{
  defaultValue: "super_admin" | "manager" | "user";
  disabledUserOption?: boolean;
}>) {
  return (
    <Field label="Rol">
      <select className={inputClass} defaultValue={defaultValue} name="globalRole">
        <option value="super_admin">Super usuario</option>
        <option disabled={disabledUserOption} value="manager">
          Manager
        </option>
        <option disabled={disabledUserOption} value="user">
          Consultor
        </option>
      </select>
    </Field>
  );
}

function UserMetric({
  label,
  value,
}: Readonly<{
  label: string;
  value: number;
}>) {
  return (
    <article className="glass-panel rounded-lg px-5 py-4">
      <p className="mono-label text-xs text-[var(--color-primary)]">{label}</p>
      <p className="mt-2 font-display text-4xl font-extrabold tracking-tight text-[var(--color-text-primary)]">{value}</p>
    </article>
  );
}
