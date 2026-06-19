import { notFound } from "next/navigation";
import { FiTag } from "react-icons/fi";

import {
  createCompany,
  deleteCompany,
  updateCompany,
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

  const { data: companiesData } = await supabase
    .from("companies")
    .select("id, slug, legacy_code, name, status")
    .order("name", { ascending: true });
  const companies = (companiesData ?? []) as Company[];

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
    </div>
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
