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
  global_role: "super_admin" | "user";
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
      <div className="mx-auto flex w-full flex-col gap-8">
        <PageHeader eyebrow="Super usuario" title="Gestion de usuarios" />
        <Feedback error={error} success={success} />
        <section className="rounded-lg border border-red-100 bg-red-50 p-6 text-sm font-semibold leading-6 text-red-950 shadow-[0_18px_42px_rgba(15,23,42,0.06)] theme-dark:border-red-900/50 theme-dark:bg-red-950/35 theme-dark:text-red-200">
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
    <div className="mx-auto flex w-full flex-col gap-8">
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

      <section className="grid gap-4 md:grid-cols-3">
        <UserMetric label="Usuarios" value={typedProfiles.length} />
        <UserMetric
          label="Super usuarios"
          value={typedProfiles.filter((profile) => profile.global_role === "super_admin").length}
        />
        <UserMetric
          label="Usuarios consulta"
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
                  <td className={`${listingCellClass} font-semibold text-slate-700 theme-dark:text-slate-100`}>
                    {profile.full_name || "Sin nombre"}
                  </td>
                  <td className={listingCellClass}>{profile.email}</td>
                  <td className={listingCellClass}>
                    <ListingStatusBadge>{profile.global_role}</ListingStatusBadge>
                  </td>
                  <td className={listingCellClass}>
                    {new Date(profile.created_at).toLocaleDateString("es-MX")}
                  </td>
                  <td className={listingActionCellClass}>
                    <div className="flex items-center justify-center gap-3">
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
    <div className="mx-auto flex w-full flex-col gap-8">
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
      <RoleField defaultValue={profile.global_role} disabledUserOption={isEditingSelf} />
      {isEditingSelf ? (
        <p className="text-xs font-semibold leading-5 text-slate-500 theme-dark:text-slate-400">
          No puedes quitarte tu propio rol de super usuario desde esta pantalla.
        </p>
      ) : null}
      <SubmitButton className={buttonClass} pendingLabel="Guardando...">
        Guardar cambios
      </SubmitButton>
    </form>
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
      <p className="text-sm leading-6 text-slate-600 theme-dark:text-slate-300">
        Esta accion eliminara la cuenta de Supabase Auth y su perfil asociado.
        No se puede deshacer.
      </p>
      {isDeletingSelf ? (
        <p className="rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-950 theme-dark:border-red-900/50 theme-dark:bg-red-950/35 theme-dark:text-red-200">
          No puedes eliminar tu propia cuenta desde esta pantalla.
        </p>
      ) : null}
      {isDeletingSelf ? (
        <button
          className="inline-flex min-h-12 items-center justify-center rounded-md bg-slate-200 px-6 py-2.5 text-sm font-extrabold text-slate-500 shadow-none disabled:cursor-not-allowed"
          disabled
          type="button"
        >
          Eliminar usuario
        </button>
      ) : (
        <SubmitButton
          className="inline-flex min-h-12 items-center justify-center rounded-md bg-red-600 px-6 py-2.5 text-sm font-extrabold text-white shadow-[0_18px_36px_rgba(220,38,38,0.20)] transition-all hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
          pendingLabel="Eliminando..."
        >
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
  defaultValue: "super_admin" | "user";
  disabledUserOption?: boolean;
}>) {
  return (
    <Field label="Rol">
      <select className={inputClass} defaultValue={defaultValue} name="globalRole">
        <option value="super_admin">Super usuario</option>
        <option disabled={disabledUserOption} value="user">
          Usuario consulta
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
    <article className="rounded-lg border border-slate-100 bg-white px-6 py-5 shadow-[0_18px_42px_rgba(15,23,42,0.06)] theme-dark:border-slate-800 theme-dark:bg-slate-900">
      <p className="text-sm font-extrabold text-red-600">{label}</p>
      <p className="mt-3 text-5xl font-extrabold tracking-tight text-slate-900 theme-dark:text-slate-100">{value}</p>
    </article>
  );
}
