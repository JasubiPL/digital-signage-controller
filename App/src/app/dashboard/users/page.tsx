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
  StatusBadge,
} from "../components";
import { getDashboardContext } from "../data";
import { DashboardDialog } from "../dialog";

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
      <div className="mx-auto flex w-[95%] flex-col gap-6">
        <PageHeader eyebrow="Super usuario" title="Gestion de usuarios" />
        <Feedback error={error} success={success} />
        <section className="border border-red-200 bg-red-50 p-5 text-sm leading-6 text-red-950">
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
    <div className="mx-auto flex w-[95%] flex-col gap-6">
      <Feedback error={error} success={success} />

      <PageHeader eyebrow="Super usuario" title="Gestion de usuarios">
        <DashboardDialog
          title="Nuevo usuario"
          trigger={
            <span className="inline-flex min-h-11 items-center justify-center bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">
              Nuevo Usuario +
            </span>
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
        <section className="overflow-x-auto bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-gray-200 font-semibold text-zinc-950">
              <tr>
                <th className="px-4 py-4">Usuario</th>
                <th className="px-4 py-4">Email</th>
                <th className="px-4 py-4">Rol</th>
                <th className="px-4 py-4">Alta</th>
                <th className="px-4 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {typedProfiles.map((profile) => (
                <tr key={profile.id}>
                  <td className="px-4 py-3 font-medium text-zinc-800">
                    {profile.full_name || "Sin nombre"}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{profile.email}</td>
                  <td className="px-4 py-3">
                    <StatusBadge>{profile.global_role}</StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {new Date(profile.created_at).toLocaleDateString("es-MX")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <DashboardDialog
                        title={`Modificar ${profile.email}`}
                        trigger={
                          <span className="inline-flex px-3 py-1.5 text-sm font-medium text-amber-600 transition hover:bg-amber-50">
                            Modificar
                          </span>
                        }
                      >
                        <EditUserForm currentUserId={user.id} profile={profile} />
                      </DashboardDialog>
                      <DashboardDialog
                        title={`Eliminar ${profile.email}`}
                        trigger={
                          <span className="inline-flex px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50">
                            Eliminar
                          </span>
                        }
                      >
                        <DeleteUserForm currentUserId={user.id} profile={profile} />
                      </DashboardDialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
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
    <div className="mx-auto flex w-[95%] flex-col gap-6">
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
      <button className={buttonClass}>Crear usuario</button>
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
        <p className="text-xs leading-5 text-zinc-500">
          No puedes quitarte tu propio rol de super usuario desde esta pantalla.
        </p>
      ) : null}
      <button className={buttonClass}>Guardar cambios</button>
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
      <p className="text-sm leading-6 text-zinc-600">
        Esta accion eliminara la cuenta de Supabase Auth y su perfil asociado.
        No se puede deshacer.
      </p>
      {isDeletingSelf ? (
        <p className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-950">
          No puedes eliminar tu propia cuenta desde esta pantalla.
        </p>
      ) : null}
      <button
        className="inline-flex min-h-10 items-center justify-center bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-zinc-500"
        disabled={isDeletingSelf}
      >
        Eliminar usuario
      </button>
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
    <article className="bg-white px-6 py-4">
      <p className="text-sm font-semibold text-red-600">{label}</p>
      <p className="mt-2 text-4xl font-semibold text-zinc-950">{value}</p>
    </article>
  );
}
