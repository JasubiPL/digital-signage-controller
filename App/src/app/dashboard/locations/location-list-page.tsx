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
  ListingStatusBadge,
  ListingTableShell,
  listingActionCellClass,
  listingCellClass,
  listingHeadClass,
  listingHeaderCellClass,
  listingRowClass,
  listingTableClass,
} from "../list-ui";

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
  campaign_id: string;
  campaigns: CampaignOption | CampaignOption[] | null;
  location_id: string;
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
            .select("location_id, campaign_id, campaigns(id, name, status)")
            .in("company_id", companyIds)
        : Promise.resolve({ data: [] }),
    ]);
  const companyById = new Map(companies.map((company) => [company.id, company]));
  const brandName = selectedCompany ? brandLabel(selectedCompany) : "Todas";
  const campaignsById = new Map((campaigns ?? []).map((campaign) => [campaign.id, campaign]));
  const campaignsByLocation = new Map<string, CampaignOption[]>();

  for (const assignment of (assignments ?? []) as LocationAssignment[]) {
    const campaign =
      firstRelated(assignment.campaigns) ?? campaignsById.get(assignment.campaign_id);
    if (!campaign) continue;
    const current = campaignsByLocation.get(assignment.location_id) ?? [];
    current.push(campaign);
    campaignsByLocation.set(assignment.location_id, current);
  }

  return (
    <div className="mx-auto flex w-full flex-col gap-8 font-['Avenir_Next','Aptos','Segoe_UI',sans-serif]">
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
                    <td className={`${listingCellClass} font-semibold text-slate-700`}>
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
                      <ListingStatusBadge>{location.status}</ListingStatusBadge>
                    </td>
                    <td className={listingActionCellClass}>
                      <div className="flex items-center justify-center gap-3">
                        <DashboardDialog
                          title={`Campañas en ${location.name}`}
                          trigger={<ActionIconTrigger label="Ver" tone="view" />}
                        >
                          <AssignmentList
                            emptyText="Esta taquilla no tiene campañas asignadas."
                            items={assignedCampaigns.map((campaign) => ({
                              helper: campaign.status,
                              id: campaign.id,
                              name: campaign.name,
                            }))}
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

                            <section className="mt-6 border-t border-slate-200 pt-5 theme-dark:border-slate-700">
                              <h3 className="text-sm font-extrabold text-slate-800 theme-dark:text-slate-100">
                                Campañas asignadas
                              </h3>
                              <form action={syncLocationCampaigns} className="mt-3 grid gap-3">
                                <input name="returnPath" type="hidden" value={next} />
                                <input name="companyId" type="hidden" value={location.company_id} />
                                <input name="locationId" type="hidden" value={location.id} />
                                <CheckboxList
                                  checkedIds={assignedCampaigns.map((campaign) => campaign.id)}
                                  emptyText="No hay campañas disponibles para esta marca."
                                  items={(campaigns ?? []).map((campaign) => ({
                                    id: campaign.id,
                                    name: campaign.name,
                                  }))}
                                  name="campaignIds"
                                />
                                <button className={buttonClass}>Guardar asignaciones</button>
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
  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      <input name="returnPath" type="hidden" value={returnPath} />
      {location ? <input name="id" type="hidden" value={location.id} /> : null}
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
      <Field label="Nombre">
        <input className={inputClass} defaultValue={location?.name} name="name" required />
      </Field>
      <Field label="Dispositivo">
        <input
          className={inputClass}
          defaultValue={location?.device ?? ""}
          name="device"
          placeholder="Pantallas, LED..."
        />
      </Field>
      <Field label="Proyeccion por">
        <input
          className={inputClass}
          defaultValue={location?.projection ?? ""}
          name="projection"
          placeholder="Player, USB..."
        />
      </Field>
      <Field label="Estatus">
        <select className={inputClass} defaultValue={location?.status ?? "ok"} name="status">
          <option value="ok">OK</option>
          <option value="remodeling">Remodelacion</option>
          <option value="incident">Pantalla con incidente</option>
          <option value="archived">Archivada</option>
        </select>
      </Field>
      <div className="flex items-end">
        <button className={buttonClass}>{submitLabel}</button>
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
          className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 theme-dark:border-slate-700"
          key={item.id}
        >
          <span className="font-semibold text-slate-800 theme-dark:text-slate-200">{item.name}</span>
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
    <div className="grid max-h-48 gap-2 overflow-y-auto rounded-md border border-slate-200 p-3 theme-dark:border-slate-700">
      {items.map((item) => (
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 theme-dark:text-slate-300" key={item.id}>
          <input defaultChecked={checkedIds.includes(item.id)} name={name} type="checkbox" value={item.id} />
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
