import { notFound } from "next/navigation";
import { FiAlertTriangle, FiFlag, FiTag, FiUsers } from "react-icons/fi";

import {
  createCompany,
  createCompanyRole,
  createIncidentCategory,
  createIncidentPriority,
  deleteCompany,
  deleteCompanyRole,
  deleteIncidentCategory,
  deleteIncidentPriority,
  updateCompany,
  updateCompanyRole,
  updateIncidentCategory,
  updateIncidentPriority,
} from "@/app/dashboard/actions";

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
  DeleteActionButton,
  ListingPrimaryAction,
  ListingTableShell,
  listingActionCellClass,
  listingCellClass,
  listingHeadClass,
  listingHeaderCellClass,
  listingRowClass,
  listingTableClass,
} from "../list-ui";

type SettingsPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

type Company = {
  id: string;
  legacy_code: string | null;
  name: string;
  slug: string;
  status: string;
};

type CatalogItem = {
  id: string;
  is_active: boolean;
  is_system: boolean;
  label: string;
  slug: string;
  sort_order: number;
  weight?: number | null;
};

const companyStatuses = ["active", "inactive", "archived"];
const returnPath = "/dashboard/settings";

export default async function SettingsPage({
  searchParams,
}: Readonly<SettingsPageProps>) {
  const [{ error, success }, { access, supabase }] = await Promise.all([
    searchParams,
    getDashboardContext(returnPath),
  ]);

  if (!access.isGlobalAdmin) {
    notFound();
  }

  const [
    { data: companiesData },
    { data: categoriesData },
    { data: prioritiesData },
    { data: rolesData },
  ] = await Promise.all([
    supabase
      .from("companies")
      .select("id, slug, legacy_code, name, status")
      .order("name", { ascending: true }),
    supabase
      .from("incident_categories")
      .select("id, slug, label, sort_order, is_active, is_system")
      .order("sort_order", { ascending: true }),
    supabase
      .from("incident_priorities")
      .select("id, slug, label, weight, sort_order, is_active, is_system")
      .order("sort_order", { ascending: true }),
    supabase
      .from("company_roles")
      .select("id, slug, label, sort_order, is_active, is_system")
      .order("sort_order", { ascending: true }),
  ]);
  const companies = (companiesData ?? []) as Company[];
  const categories = (categoriesData ?? []) as CatalogItem[];
  const priorities = (prioritiesData ?? []) as CatalogItem[];
  const roles = (rolesData ?? []) as CatalogItem[];

  return (
    <div className="mx-auto flex w-full flex-col gap-6">
      <Feedback error={error} success={success} />

      <PageHeader eyebrow="Configuracion" title="Ajustes del sistema">
        <DashboardDialog
          title="Nueva marca"
          trigger={<ListingPrimaryAction>Nueva marca +</ListingPrimaryAction>}
        >
          <CompanyForm />
        </DashboardDialog>
      </PageHeader>

      <section className="glass-panel rounded-lg p-6">
        <div className="flex items-center gap-3">
          <span className="text-[var(--color-primary)]"><FiTag aria-hidden="true" /></span>
          <h2 className="font-display text-xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
            Marcas
          </h2>
        </div>
        <p className="mt-2 text-sm font-semibold text-[var(--color-text-muted)]">
          Crea y administra las marcas (companias) disponibles para taquillas, campañas e incidentes.
        </p>

        <div className="mt-5">
          {!companies.length ? (
            <EmptyState>Aun no hay marcas. Crea la primera para empezar.</EmptyState>
          ) : (
            <ListingTableShell>
              <table className={listingTableClass}>
                <thead className={listingHeadClass}>
                  <tr>
                    <th className={listingHeaderCellClass}>Marca</th>
                    <th className={listingHeaderCellClass}>Identificador</th>
                    <th className={listingHeaderCellClass}>Codigo</th>
                    <th className={listingHeaderCellClass}>Estado</th>
                    <th className={`${listingHeaderCellClass} text-center`}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company) => (
                    <tr className={listingRowClass} key={company.id}>
                      <td className={`${listingCellClass} font-semibold text-[var(--color-text-primary)]`}>
                        {company.name}
                      </td>
                      <td className={`${listingCellClass} font-mono text-xs`}>{company.slug}</td>
                      <td className={listingCellClass}>{company.legacy_code || "—"}</td>
                      <td className={listingCellClass}>{statusLabel(company.status)}</td>
                      <td className={listingActionCellClass}>
                        <div className="flex justify-center gap-2">
                          <DashboardDialog
                            title={`Editar ${company.name}`}
                            trigger={
                              <button className={`${buttonClass} min-h-9 px-3 py-1`} type="button">
                                Editar
                              </button>
                            }
                          >
                            <CompanyForm company={company} />
                          </DashboardDialog>
                          <form action={deleteCompany}>
                            <input name="returnPath" type="hidden" value={returnPath} />
                            <input name="id" type="hidden" value={company.id} />
                            <DeleteActionButton label={`Eliminar ${company.name}`} />
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ListingTableShell>
          )}
        </div>
      </section>

      <CatalogSection
        createAction={createIncidentCategory}
        deleteAction={deleteIncidentCategory}
        description="Tipos de incidencia disponibles al registrar un incidente."
        emptyLabel="Aun no hay categorias."
        icon={<FiAlertTriangle aria-hidden="true" />}
        items={categories}
        title="Categorias de incidencias"
        updateAction={updateIncidentCategory}
      />

      <CatalogSection
        createAction={createIncidentPriority}
        deleteAction={deleteIncidentPriority}
        description="Niveles de prioridad. El peso ordena de menor a mayor severidad."
        emptyLabel="Aun no hay prioridades."
        icon={<FiFlag aria-hidden="true" />}
        items={priorities}
        title="Prioridades de incidencias"
        updateAction={updateIncidentPriority}
        withWeight
      />

      <CatalogSection
        createAction={createCompanyRole}
        deleteAction={deleteCompanyRole}
        description="Roles asignables a usuarios dentro de una marca."
        emptyLabel="Aun no hay roles."
        icon={<FiUsers aria-hidden="true" />}
        items={roles}
        title="Roles de empresa"
        updateAction={updateCompanyRole}
      />
    </div>
  );
}

type CatalogAction = (formData: FormData) => Promise<void>;

function CatalogSection({
  createAction,
  deleteAction,
  description,
  emptyLabel,
  icon,
  items,
  title,
  updateAction,
  withWeight = false,
}: Readonly<{
  createAction: CatalogAction;
  deleteAction: CatalogAction;
  description: string;
  emptyLabel: string;
  icon: React.ReactNode;
  items: CatalogItem[];
  title: string;
  updateAction: CatalogAction;
  withWeight?: boolean;
}>) {
  return (
    <section className="glass-panel rounded-lg p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-[var(--color-primary)]">{icon}</span>
          <h2 className="font-display text-xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
            {title}
          </h2>
        </div>
        <DashboardDialog
          title={`Nuevo: ${title}`}
          trigger={<ListingPrimaryAction>Agregar +</ListingPrimaryAction>}
        >
          <CatalogForm action={createAction} withWeight={withWeight} />
        </DashboardDialog>
      </div>
      <p className="mt-2 text-sm font-semibold text-[var(--color-text-muted)]">{description}</p>

      <div className="mt-5">
        {!items.length ? (
          <EmptyState>{emptyLabel}</EmptyState>
        ) : (
          <ListingTableShell>
            <table className={listingTableClass}>
              <thead className={listingHeadClass}>
                <tr>
                  <th className={listingHeaderCellClass}>Etiqueta</th>
                  <th className={listingHeaderCellClass}>Identificador</th>
                  {withWeight ? <th className={listingHeaderCellClass}>Peso</th> : null}
                  <th className={listingHeaderCellClass}>Orden</th>
                  <th className={listingHeaderCellClass}>Estado</th>
                  <th className={`${listingHeaderCellClass} text-center`}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr className={listingRowClass} key={item.id}>
                    <td className={`${listingCellClass} font-semibold text-[var(--color-text-primary)]`}>
                      {item.label}
                      {item.is_system ? (
                        <span className="ml-2 rounded-full border border-[var(--color-border)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-muted)]">
                          sistema
                        </span>
                      ) : null}
                    </td>
                    <td className={`${listingCellClass} font-mono text-xs`}>{item.slug}</td>
                    {withWeight ? <td className={listingCellClass}>{item.weight ?? 0}</td> : null}
                    <td className={listingCellClass}>{item.sort_order}</td>
                    <td className={listingCellClass}>{item.is_active ? "Activo" : "Inactivo"}</td>
                    <td className={listingActionCellClass}>
                      <div className="flex justify-center gap-2">
                        <DashboardDialog
                          title={`Editar ${item.label}`}
                          trigger={
                            <button className={`${buttonClass} min-h-9 px-3 py-1`} type="button">
                              Editar
                            </button>
                          }
                        >
                          <CatalogForm action={updateAction} item={item} withWeight={withWeight} />
                        </DashboardDialog>
                        {items.length > 1 ? (
                          <form action={deleteAction}>
                            <input name="returnPath" type="hidden" value={returnPath} />
                            <input name="id" type="hidden" value={item.id} />
                            <DeleteActionButton label={`Eliminar ${item.label}`} />
                          </form>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ListingTableShell>
        )}
      </div>
    </section>
  );
}

function CatalogForm({
  action,
  item,
  withWeight = false,
}: Readonly<{
  action: CatalogAction;
  item?: CatalogItem;
  withWeight?: boolean;
}>) {
  const isEdit = Boolean(item);

  return (
    <form action={action} className="grid gap-4">
      <input name="returnPath" type="hidden" value={returnPath} />
      {isEdit ? <input name="id" type="hidden" value={item!.id} /> : null}
      <Field label="Etiqueta">
        <input className={inputClass} defaultValue={item?.label ?? ""} name="label" required />
      </Field>
      {isEdit ? (
        <Field label="Identificador (slug)">
          <input className={`${inputClass} opacity-60`} defaultValue={item?.slug ?? ""} disabled />
        </Field>
      ) : (
        <Field label="Identificador (slug)">
          <input
            className={inputClass}
            name="slug"
            pattern="[a-z0-9]+(?:_[a-z0-9]+)*"
            placeholder="mi_valor"
            required
            title="Solo minusculas, numeros y guion bajo."
          />
        </Field>
      )}
      {withWeight ? (
        <Field label="Peso (severidad)">
          <input className={inputClass} defaultValue={item?.weight ?? 0} min={0} name="weight" type="number" />
        </Field>
      ) : null}
      <Field label="Orden">
        <input className={inputClass} defaultValue={item?.sort_order ?? 0} min={0} name="sortOrder" type="number" />
      </Field>
      {isEdit ? (
        <label className="flex items-center gap-3 text-sm font-semibold text-[var(--color-text-secondary)]">
          <input
            className="h-4 w-4 accent-[var(--color-primary)]"
            defaultChecked={item?.is_active ?? true}
            name="isActive"
            type="checkbox"
            value="true"
          />
          Activo
        </label>
      ) : null}
      <button className={buttonClass} type="submit">
        {isEdit ? "Guardar cambios" : "Crear"}
      </button>
    </form>
  );
}

function CompanyForm({ company }: Readonly<{ company?: Company }>) {
  const isEdit = Boolean(company);

  return (
    <form action={isEdit ? updateCompany : createCompany} className="grid gap-4">
      <input name="returnPath" type="hidden" value={returnPath} />
      {isEdit ? <input name="id" type="hidden" value={company!.id} /> : null}
      <Field label="Nombre">
        <input
          className={inputClass}
          defaultValue={company?.name ?? ""}
          name="name"
          placeholder="Ej. Mi Empresa"
          required
        />
      </Field>
      <Field label="Identificador (slug)">
        <input
          className={inputClass}
          defaultValue={company?.slug ?? ""}
          name="slug"
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          placeholder="mi-empresa"
          required
          title="Solo minusculas, numeros y guiones."
        />
      </Field>
      <Field label="Codigo corto (opcional)">
        <input
          className={inputClass}
          defaultValue={company?.legacy_code ?? ""}
          name="legacyCode"
          placeholder="Ej. ME"
        />
      </Field>
      <Field label="Estado">
        <select className={inputClass} defaultValue={company?.status ?? "active"} name="status">
          {companyStatuses.map((status) => (
            <option key={status} value={status}>
              {statusLabel(status)}
            </option>
          ))}
        </select>
      </Field>
      <button className={buttonClass} type="submit">
        {isEdit ? "Guardar cambios" : "Crear marca"}
      </button>
    </form>
  );
}

function statusLabel(value: string) {
  const labels: Record<string, string> = {
    active: "Activa",
    archived: "Archivada",
    inactive: "Inactiva",
  };

  return labels[value] ?? value;
}
