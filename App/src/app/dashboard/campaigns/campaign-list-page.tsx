import { notFound } from "next/navigation";

import {
  createCampaign,
  deleteCampaign,
  syncCampaignLocations,
  updateCampaign,
} from "@/app/dashboard/actions";

import {
  buttonClass,
  EmptyState,
  Feedback,
  Field,
  inputClass,
  StatusBadge,
} from "../components";
import { formatDate, getDashboardContext } from "../data";
import { DashboardDialog } from "../dialog";
import {
  ActionIconTrigger,
  DeleteActionButton,
  ListingHeader,
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

type CampaignListPageProps = {
  companySlug?: string;
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

type LocationOption = {
  id: string;
  name: string;
  status: string;
};

type CampaignAssignment = {
  campaign_id: string;
  location_id: string;
  locations: LocationOption | LocationOption[] | null;
};

export async function CampaignListPage({
  companySlug,
  searchParams,
}: Readonly<CampaignListPageProps>) {
  const next = companySlug
    ? `/dashboard/campaigns/${companySlug}`
    : "/dashboard/campaigns";
  const [{ error, success }, { access, companies, supabase }] = await Promise.all([
    searchParams,
    getDashboardContext(next),
  ]);
  const selectedCompany = companySlug
    ? companies.find((company) => company.slug === companySlug)
    : null;

  if (companySlug && !selectedCompany) {
    notFound();
  }

  const availableCompanies = selectedCompany ? [selectedCompany] : companies;
  const companyIds = availableCompanies.map((company) => company.id);
  const isAdmin = access.isGlobalAdmin;
  const [{ data: campaigns }, { data: locations }, { data: assignments }] =
    await Promise.all([
      companyIds.length
        ? supabase
            .from("campaigns")
            .select("id, company_id, name, starts_on, ends_on, status, created_at")
            .in("company_id", companyIds)
            .order("name", { ascending: true })
        : Promise.resolve({ data: [] }),
      companyIds.length
        ? supabase
            .from("locations")
            .select("id, company_id, name, status")
            .in("company_id", companyIds)
            .order("name", { ascending: true })
        : Promise.resolve({ data: [] }),
      companyIds.length
        ? supabase
            .from("campaign_locations")
            .select("campaign_id, location_id, locations(id, name, status)")
            .in("company_id", companyIds)
        : Promise.resolve({ data: [] }),
    ]);
  const companyById = new Map(companies.map((company) => [company.id, company]));
  const brandName = selectedCompany ? brandLabel(selectedCompany) : "Todas";
  const locationsById = new Map((locations ?? []).map((location) => [location.id, location]));
  const locationsByCampaign = new Map<string, LocationOption[]>();

  for (const assignment of (assignments ?? []) as CampaignAssignment[]) {
    const location =
      firstRelated(assignment.locations) ?? locationsById.get(assignment.location_id);
    if (!location) continue;
    const current = locationsByCampaign.get(assignment.campaign_id) ?? [];
    current.push(location);
    locationsByCampaign.set(assignment.campaign_id, current);
  }

  return (
    <div className="mx-auto flex w-full flex-col gap-6">
      <Feedback error={error} success={success} />

      <ListingHeader
        action={
          isAdmin ? (
            <DashboardDialog
              title="Nueva Campaña"
              trigger={
                <ListingPrimaryAction>
                  Nueva Campaña +
                </ListingPrimaryAction>
              }
            >
              <CampaignForm
                action={createCampaign}
                companies={availableCompanies}
                returnPath={next}
                submitLabel="Crear campaña"
              />
            </DashboardDialog>
          ) : null
        }
        count={campaigns?.length ?? 0}
        icon="campaigns"
        metricLabel="No. Campañas"
        title={brandName}
      />

      {!campaigns?.length ? (
        <EmptyState>
          {selectedCompany
            ? `No hay campañas disponibles para ${brandName}.`
            : "No hay campañas disponibles para tus marcas."}
        </EmptyState>
      ) : (
        <ListingTableShell>
          <table className={listingTableClass}>
            <thead className={listingHeadClass}>
              <tr>
                <th className={listingHeaderCellClass}>Campaña</th>
                {!selectedCompany ? <th className={listingHeaderCellClass}>Marca</th> : null}
                <th className={listingHeaderCellClass}>Inicio</th>
                <th className={listingHeaderCellClass}>Fin</th>
                <th className={listingHeaderCellClass}>Estatus</th>
                <th className={`${listingHeaderCellClass} text-center`}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => {
                const assignedLocations = locationsByCampaign.get(campaign.id) ?? [];

                return (
                  <tr className={listingRowClass} key={campaign.id}>
                    <td className={`${listingCellClass} font-semibold text-[var(--color-text-primary)]`}>
                      {campaign.name}
                    </td>
                    {!selectedCompany ? (
                      <td className={listingCellClass}>
                        {brandLabel(companyById.get(campaign.company_id))}
                      </td>
                    ) : null}
                    <td className={listingCellClass}>{formatDate(campaign.starts_on)}</td>
                    <td className={listingCellClass}>{formatDate(campaign.ends_on)}</td>
                    <td className={listingCellClass}>
                      <ListingStatusBadge>{campaign.status}</ListingStatusBadge>
                    </td>
                    <td className={listingActionCellClass}>
                      <div className="flex items-center justify-center gap-2">
                        <DashboardDialog
                          title={`Taquillas asignadas a ${campaign.name}`}
                          trigger={<ActionIconTrigger label="Ver" tone="view" />}
                        >
                          <AssignmentList
                            emptyText="Esta campaña no tiene taquillas asignadas."
                            items={assignedLocations.map((location) => ({
                              helper: location.status,
                              id: location.id,
                              name: location.name,
                            }))}
                          />
                        </DashboardDialog>

                        {isAdmin ? (
                          <DashboardDialog
                            title={`Modificar ${campaign.name}`}
                            trigger={<ActionIconTrigger label="Modificar" tone="edit" />}
                          >
                            <CampaignForm
                              action={updateCampaign}
                              campaign={campaign}
                              companies={availableCompanies}
                              returnPath={next}
                              submitLabel="Guardar cambios"
                            />

                            <section className="mt-6 border-t border-[var(--color-border)] pt-5">
                              <h3 className="mono-label text-sm font-extrabold text-[var(--color-text-primary)]">
                                Taquillas asignadas
                              </h3>
                              <form action={syncCampaignLocations} className="mt-3 grid gap-3">
                                <input name="returnPath" type="hidden" value={next} />
                                <input name="companyId" type="hidden" value={campaign.company_id} />
                                <input name="campaignId" type="hidden" value={campaign.id} />
                                <CheckboxList
                                  checkedIds={assignedLocations.map((location) => location.id)}
                                  emptyText="No hay taquillas disponibles para esta marca."
                                  items={(locations ?? []).map((location) => ({
                                    id: location.id,
                                    name: location.name,
                                  }))}
                                  name="locationIds"
                                />
                                <SubmitButton className={buttonClass} pendingLabel="Guardando...">
                                  Guardar asignaciones
                                </SubmitButton>
                              </form>
                            </section>
                          </DashboardDialog>
                        ) : null}

                        {isAdmin ? (
                          <form action={deleteCampaign}>
                            <input name="returnPath" type="hidden" value={next} />
                            <input name="id" type="hidden" value={campaign.id} />
                            <input name="companyId" type="hidden" value={campaign.company_id} />
                            <DeleteActionButton />
                          </form>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </ListingTableShell>
      )}
    </div>
  );
}

function firstRelated<T>(value: T | T[] | null) {
  return Array.isArray(value) ? value[0] : value;
}

function CampaignForm({
  action,
  campaign,
  companies,
  returnPath,
  submitLabel,
}: Readonly<{
  action: (formData: FormData) => Promise<void>;
  campaign?: {
    company_id: string;
    ends_on: string | null;
    id: string;
    name: string;
    starts_on: string | null;
    status: string;
  };
  companies: Array<{ id: string; legacy_code?: string | null; name: string; slug: string }>;
  returnPath: string;
  submitLabel: string;
}>) {
  const singleCompany = companies.length === 1 ? companies[0] : null;

  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      <input name="returnPath" type="hidden" value={returnPath} />
      {campaign ? <input name="id" type="hidden" value={campaign.id} /> : null}
      {singleCompany ? (
        <input name="companyId" type="hidden" value={singleCompany.id} />
      ) : (
        <Field label="Marca">
          <select
            className={inputClass}
            defaultValue={campaign?.company_id}
            name="companyId"
            required
          >
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {brandLabel(company)}
              </option>
            ))}
          </select>
        </Field>
      )}
      <Field label="Nombre">
        <input className={inputClass} defaultValue={campaign?.name} name="name" required />
      </Field>
      <Field label="Inicio">
        <input className={inputClass} defaultValue={campaign?.starts_on ?? ""} name="startsOn" type="date" />
      </Field>
      <Field label="Fin">
        <input className={inputClass} defaultValue={campaign?.ends_on ?? ""} name="endsOn" type="date" />
      </Field>
      <Field label="Estatus">
        <select className={inputClass} defaultValue={campaign?.status ?? "draft"} name="status">
          <option value="active">Activa</option>
          <option value="draft">Pendiente de Carga</option>
          <option value="inactive">Inactiva</option>
        </select>
      </Field>
      <div className="flex items-end">
        <SubmitButton className={buttonClass}>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}

function AssignmentList({
  emptyText,
  items,
}: Readonly<{
  emptyText: string;
  items: Array<{ helper: string; id: string; name: string }>;
}>) {
  if (!items.length) {
    return <EmptyState>{emptyText}</EmptyState>;
  }

  return (
    <ul className="grid gap-2">
      {items.map((item) => (
        <li
          className="flex items-center justify-between gap-4 rounded-md border border-[var(--color-border)] bg-[rgba(2,6,23,0.34)] px-3 py-3"
          key={item.id}
        >
          <span className="font-semibold text-[var(--color-text-primary)]">{item.name}</span>
          <StatusBadge>{item.helper}</StatusBadge>
        </li>
      ))}
    </ul>
  );
}

function CheckboxList({
  checkedIds,
  emptyText,
  items,
  name,
}: Readonly<{
  checkedIds: string[];
  emptyText: string;
  items: Array<{ id: string; name: string }>;
  name: string;
}>) {
  if (!items.length) {
    return <EmptyState>{emptyText}</EmptyState>;
  }

  return (
    <div className="grid max-h-48 gap-2 overflow-y-auto rounded-md border border-[var(--color-border)] bg-[rgba(2,6,23,0.34)] p-3">
      {items.map((item) => (
        <label className="flex min-h-10 items-center gap-3 rounded-md border border-transparent px-3 py-2 text-sm font-semibold text-[var(--color-text-secondary)] transition hover:border-[var(--color-border)] hover:bg-[rgba(34,211,238,0.045)]" key={item.id}>
          <input className="h-4 w-4 accent-[var(--color-primary)]" defaultChecked={checkedIds.includes(item.id)} name={name} type="checkbox" value={item.id} />
          {item.name}
        </label>
      ))}
    </div>
  );
}

function brandLabel(company?: { legacy_code?: string | null; name: string; slug: string }) {
  if (!company) return "Sin marca";

  return company.legacy_code || company.name;
}
