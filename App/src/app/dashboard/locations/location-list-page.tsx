import { notFound } from "next/navigation";

import {
  createLocation,
  deleteLocation,
  syncLocationCampaigns,
  updateLocation,
} from "@/app/dashboard/actions";

import {
  buttonClass,
  EmptyState,
  Feedback,
  Field,
  inputClass,
  StatusBadge,
} from "../components";
import { getDashboardContext } from "../data";
import { DashboardDialog } from "../dialog";
import {
  ActionIconTrigger,
  DeleteActionButton,
  ListingHeader,
  ListingPrimaryAction,
  ListingTableShell,
  listingActionCellClass,
  listingCellClass,
  listingHeadClass,
  listingHeaderCellClass,
  listingRowClass,
  listingTableClass,
} from "../list-ui";
import { AssignmentStatusEditor } from "./assignment-status-editor";
import { SubmitButton } from "../submit-button";

type LocationListPageProps = {
  companySlug?: string;
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

type CampaignOption = {
  id: string;
  name: string;
  status: string;
};

type LocationAssignment = {
  id: string;
  campaign_id: string;
  campaigns: CampaignOption | CampaignOption[] | null;
  company_id: string;
  location_id: string;
  status: string;
};

type AssignedCampaign = {
  assignmentId: string;
  campaignId: string;
  companyId: string;
  name: string;
  status: string;
};

export async function LocationListPage({
  companySlug,
  searchParams,
}: Readonly<LocationListPageProps>) {
  const next = companySlug
    ? `/dashboard/locations/${companySlug}`
    : "/dashboard/locations";
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
  const [{ data: locations }, { data: campaigns }, { data: assignments }] =
    await Promise.all([
      companyIds.length
        ? supabase
            .from("locations")
            .select("id, company_id, name, device, projection, status")
            .in("company_id", companyIds)
            .order("name", { ascending: true })
        : Promise.resolve({ data: [] }),
      companyIds.length
        ? supabase
            .from("campaigns")
            .select("id, company_id, name, status")
            .in("company_id", companyIds)
            .order("name", { ascending: true })
        : Promise.resolve({ data: [] }),
      companyIds.length
        ? supabase
            .from("campaign_locations")
            .select("id, company_id, location_id, campaign_id, status, campaigns(id, name, status)")
            .in("company_id", companyIds)
        : Promise.resolve({ data: [] }),
    ]);
  const companyById = new Map(companies.map((company) => [company.id, company]));
  const brandName = selectedCompany ? brandLabel(selectedCompany) : "Todas";
  const campaignsById = new Map((campaigns ?? []).map((campaign) => [campaign.id, campaign]));
  const campaignsByLocation = new Map<string, AssignedCampaign[]>();

  for (const assignment of (assignments ?? []) as LocationAssignment[]) {
    const campaign =
      firstRelated(assignment.campaigns) ?? campaignsById.get(assignment.campaign_id);
    if (!campaign) continue;
    const current = campaignsByLocation.get(assignment.location_id) ?? [];
    current.push({
      assignmentId: assignment.id,
      campaignId: assignment.campaign_id,
      companyId: assignment.company_id,
      name: campaign.name,
      status: assignment.status,
    });
    campaignsByLocation.set(assignment.location_id, current);
  }

  return (
    <div className="mx-auto flex w-full flex-col gap-8">
      <Feedback error={error} success={success} />

      <ListingHeader
        action={
          isAdmin ? (
            <DashboardDialog
              title="Nueva Taquilla"
              trigger={
                <ListingPrimaryAction>
                  Nueva Taquilla +
                </ListingPrimaryAction>
              }
            >
              <LocationForm
                action={createLocation}
                companies={availableCompanies}
                returnPath={next}
                submitLabel="Crear taquilla"
              />
            </DashboardDialog>
          ) : null
        }
        count={locations?.length ?? 0}
        icon="locations"
        metricLabel="No. Taquillas"
        title={brandName}
      />

      {!locations?.length ? (
        <EmptyState>
          {selectedCompany
            ? `No hay taquillas disponibles para ${brandName}.`
            : "No hay taquillas disponibles para tus marcas."}
        </EmptyState>
      ) : (
        <ListingTableShell>
          <table className={listingTableClass}>
            <thead className={listingHeadClass}>
              <tr>
                <th className={listingHeaderCellClass}>Taquilla</th>
                {!selectedCompany ? <th className={listingHeaderCellClass}>Marca</th> : null}
                <th className={listingHeaderCellClass}>Dispositivo</th>
                <th className={listingHeaderCellClass}>Proyeccion por</th>
                <th className={listingHeaderCellClass}>Estatus</th>
                <th className={`${listingHeaderCellClass} text-center`}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((location) => {
                const assignedCampaigns = campaignsByLocation.get(location.id) ?? [];

                return (
                  <tr className={listingRowClass} key={location.id}>
                    <td className={`${listingCellClass} font-semibold text-[var(--color-text-primary)]`}>
                      {location.name}
                    </td>
                    {!selectedCompany ? (
                      <td className={listingCellClass}>
                        {brandLabel(companyById.get(location.company_id))}
                      </td>
                    ) : null}
                    <td className={listingCellClass}>{location.device ?? "Sin dato"}</td>
                    <td className={listingCellClass}>{location.projection ?? "Sin dato"}</td>
                    <td className={listingCellClass}>
                      <LocationStatusBadge>{location.status}</LocationStatusBadge>
                    </td>
                    <td className={listingActionCellClass}>
                      <div className="flex items-center justify-center gap-3">
                        <DashboardDialog
                          title={`Campañas en ${location.name}`}
                          trigger={<ActionIconTrigger label="Ver" tone="view" />}
                        >
                          <AssignmentList
                            canEdit={isAdmin}
                            emptyText="Esta taquilla no tiene campañas asignadas."
                            items={assignedCampaigns}
                          />
                        </DashboardDialog>

                        {isAdmin ? (
                          <DashboardDialog
                            title={`Modificar ${location.name}`}
                            trigger={<ActionIconTrigger label="Modificar" tone="edit" />}
                          >
                            <LocationForm
                              action={updateLocation}
                              companies={availableCompanies}
                              location={location}
                              returnPath={next}
                              submitLabel="Guardar cambios"
                            />

                            <section className="mt-6 border-t border-[var(--color-border)] pt-5">
                              <h3 className="mono-label text-sm font-extrabold text-[var(--color-text-primary)]">
                                Campañas asignadas
                              </h3>
                              <form action={syncLocationCampaigns} className="mt-3 grid gap-3">
                                <input name="returnPath" type="hidden" value={next} />
                                <input name="companyId" type="hidden" value={location.company_id} />
                                <input name="locationId" type="hidden" value={location.id} />
                                <CheckboxList
                                  checkedIds={assignedCampaigns.map((campaign) => campaign.campaignId)}
                                  emptyText="No hay campañas disponibles para esta marca."
                                  items={(campaigns ?? []).map((campaign) => ({
                                    id: campaign.id,
                                    name: campaign.name,
                                  }))}
                                  name="campaignIds"
                                />
                                <SubmitButton className={buttonClass} pendingLabel="Guardando...">
                                  Guardar asignaciones
                                </SubmitButton>
                              </form>
                            </section>
                          </DashboardDialog>
                        ) : null}

                        {isAdmin ? (
                          <form action={deleteLocation}>
                            <input name="returnPath" type="hidden" value={next} />
                            <input name="id" type="hidden" value={location.id} />
                            <input name="companyId" type="hidden" value={location.company_id} />
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

function locationStatusValue(status?: string | null) {
  if (status === "active") return "ok";
  if (status === "maintenance") return "remodeling";
  if (status === "inactive") return "incident";
  if (status === "remodeling" || status === "incident") return status;

  return "ok";
}

function LocationStatusBadge({ children }: Readonly<{ children: React.ReactNode }>) {
  const value = locationStatusValue(String(children));
  const labelByStatus: Record<string, string> = {
    incident: "Con Incidente",
    ok: "OK",
    remodeling: "Remodelacion",
  };
  const tone =
    value === "ok"
      ? "border-[var(--color-primary-border)] bg-[var(--color-primary-muted)] text-[var(--color-primary-soft)]"
      : value === "remodeling"
        ? "border-[rgba(255,177,59,0.34)] bg-[var(--color-tertiary-muted)] text-[var(--color-tertiary-soft)]"
        : "border-[rgba(244,63,94,0.34)] bg-[var(--color-secondary-muted)] text-[var(--color-secondary-soft)]";

  return (
    <span className={`inline-flex min-w-36 items-center justify-center gap-2 rounded-md border px-4 py-2.5 font-mono text-sm font-bold ${tone}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_10px_currentColor]" />
      {labelByStatus[value]}
    </span>
  );
}

function LocationForm({
  action,
  companies,
  location,
  returnPath,
  submitLabel,
}: Readonly<{
  action: (formData: FormData) => Promise<void>;
  companies: Array<{ id: string; legacy_code?: string | null; name: string; slug: string }>;
  location?: {
    company_id: string;
    device: string | null;
    id: string;
    name: string;
    projection: string | null;
    status: string;
  };
  returnPath: string;
  submitLabel: string;
}>) {
  const singleCompany = companies.length === 1 ? companies[0] : null;

  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      <input name="returnPath" type="hidden" value={returnPath} />
      {location ? <input name="id" type="hidden" value={location.id} /> : null}
      {singleCompany ? (
        <input name="companyId" type="hidden" value={singleCompany.id} />
      ) : (
        <Field label="Marca">
          <select
            className={inputClass}
            defaultValue={location?.company_id}
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
        <input className={inputClass} defaultValue={location?.name} name="name" required />
      </Field>
      <Field label="Dispositivo">
        <select className={inputClass} defaultValue={location?.device ?? "Pantallas"} name="device">
          <option value="Pantallas">Pantallas</option>
          <option value="Panel Led">Panel Led</option>
        </select>
      </Field>
      <Field label="Proyeccion por">
        <select className={inputClass} defaultValue={location?.projection ?? "Players"} name="projection">
          <option value="Players">Players</option>
          <option value="USB">USB</option>
          <option value="Streaming">Streaming</option>
        </select>
      </Field>
      <Field label="Estatus">
        <select className={inputClass} defaultValue={locationStatusValue(location?.status)} name="status">
          <option value="ok">OK</option>
          <option value="remodeling">Remodelacion</option>
          <option value="incident">Con Incidente</option>
        </select>
      </Field>
      <div className="flex items-end">
        <SubmitButton className={buttonClass}>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}

function AssignmentList({
  canEdit,
  emptyText,
  items,
}: Readonly<{
  canEdit: boolean;
  emptyText: string;
  items: AssignedCampaign[];
}>) {
  if (!items.length) {
    return <EmptyState>{emptyText}</EmptyState>;
  }

  return (
    <section className="overflow-hidden rounded-md border border-[var(--color-border)] bg-[rgba(2,6,23,0.34)]">
      <div className={`grid gap-3 border-b border-[var(--color-border)] bg-[rgba(6,14,32,0.72)] px-3 py-2 font-mono text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--color-text-muted)] ${
        canEdit ? "grid-cols-[1fr_12rem_4rem]" : "grid-cols-[1fr_12rem]"
      }`}>
        <span>Nombre de campaña</span>
        <span>Estatus</span>
        {canEdit ? <span className="text-center">Editar</span> : null}
      </div>
      {items.map((item) => (
        <div
          className={`grid items-center gap-3 border-b border-[var(--color-border)] px-3 py-3 last:border-b-0 ${
            canEdit ? "grid-cols-[1fr_12rem_4rem]" : "grid-cols-[1fr_12rem]"
          }`}
          key={item.assignmentId}
        >
          <span className="font-semibold text-[var(--color-text-primary)]">
            {item.name}
          </span>
          {canEdit ? (
            <AssignmentStatusEditor
              assignmentId={item.assignmentId}
              campaignName={item.name}
              initialStatus={item.status}
            />
          ) : (
            <StatusBadge>{item.status}</StatusBadge>
          )}
        </div>
      ))}
    </section>
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
  if (company.slug === "etn") return "ETN";
  if (company.slug === "gho") return "GHO";
  if (company.slug === "costaline") return "Costaline";

  return company.legacy_code || company.name;
}
