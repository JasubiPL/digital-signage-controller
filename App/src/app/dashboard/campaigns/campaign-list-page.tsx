import { notFound } from "next/navigation";

import {
  createCampaign,
  deleteCampaign,
  syncCampaignLocations,
  updateCampaign,
} from "@/app/dashboard/actions";

import {
  buttonClass,
  dangerButtonClass,
  EmptyState,
  Feedback,
  Field,
  inputClass,
  StatusBadge,
} from "../components";
import { formatDate, getDashboardContext } from "../data";
import { DashboardDialog } from "../dialog";

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
    <div className="mx-auto flex w-[95%] flex-col gap-6">
      <Feedback error={error} success={success} />

      <header className="grid items-center gap-4 md:grid-cols-3">
        <p className="text-xl font-semibold text-red-700">
          No. Campañas: {campaigns?.length ?? 0}
        </p>
        <h1 className="text-center text-3xl font-bold italic tracking-tight text-slate-700">
          {brandName}
        </h1>
        <div className="flex justify-end">
          {isAdmin ? (
            <DashboardDialog
              title="Nueva Campaña"
              trigger={
                <span className="inline-flex min-h-11 items-center justify-center bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">
                  Nueva Campaña +
                </span>
              }
            >
              <CampaignForm
                action={createCampaign}
                companies={availableCompanies}
                returnPath={next}
                submitLabel="Crear campaña"
              />
            </DashboardDialog>
          ) : null}
        </div>
      </header>

      {!campaigns?.length ? (
        <EmptyState>
          {selectedCompany
            ? `No hay campañas disponibles para ${brandName}.`
            : "No hay campañas disponibles para tus marcas."}
        </EmptyState>
      ) : (
        <section className="overflow-x-auto bg-white shadow-sm">
          <table className="w-full min-w-[860px] text-center text-sm">
            <thead className="border-b border-gray-200 font-semibold text-zinc-950">
              <tr>
                <th className="py-4 pr-4 text-left">Campaña</th>
                {!selectedCompany ? <th className="py-4 pr-4">Marca</th> : null}
                <th className="py-4 pr-4">Inicio</th>
                <th className="py-4 pr-4">Fin</th>
                <th className="py-4 pr-4">Estatus</th>
                <th className="py-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {campaigns.map((campaign) => {
                const assignedLocations = locationsByCampaign.get(campaign.id) ?? [];

                return (
                  <tr key={campaign.id}>
                    <td className="py-3 pr-4 text-left font-medium text-zinc-700">
                      {campaign.name}
                    </td>
                    {!selectedCompany ? (
                      <td className="py-3 pr-4">
                        {brandLabel(companyById.get(campaign.company_id))}
                      </td>
                    ) : null}
                    <td className="py-3 pr-4">{formatDate(campaign.starts_on)}</td>
                    <td className="py-3 pr-4">{formatDate(campaign.ends_on)}</td>
                    <td className="py-3 pr-4">
                      <StatusBadge>{campaign.status}</StatusBadge>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center justify-center gap-3">
                        <DashboardDialog
                          title={`Taquillas asignadas a ${campaign.name}`}
                          trigger={<ActionIcon label="Ver" tone="view" />}
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
                            trigger={<ActionIcon label="Modificar" tone="edit" />}
                          >
                            <CampaignForm
                              action={updateCampaign}
                              campaign={campaign}
                              companies={availableCompanies}
                              returnPath={next}
                              submitLabel="Guardar cambios"
                            />

                            <section className="mt-6 border-t border-zinc-200 pt-5">
                              <h3 className="text-sm font-semibold text-zinc-950">
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
                                <button className={buttonClass}>Guardar asignaciones</button>
                              </form>
                            </section>
                          </DashboardDialog>
                        ) : null}

                        {isAdmin ? (
                          <form action={deleteCampaign}>
                            <input name="returnPath" type="hidden" value={next} />
                            <input name="id" type="hidden" value={campaign.id} />
                            <input name="companyId" type="hidden" value={campaign.company_id} />
                            <button className={dangerButtonClass} title="Eliminar">
                              <DeleteIcon />
                            </button>
                          </form>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
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
  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      <input name="returnPath" type="hidden" value={returnPath} />
      {campaign ? <input name="id" type="hidden" value={campaign.id} /> : null}
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
          <option value="draft">Borrador</option>
          <option value="active">Activa</option>
          <option value="inactive">Inactiva</option>
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
          className="flex items-center justify-between border border-zinc-200 px-3 py-2"
          key={item.id}
        >
          <span className="font-medium text-zinc-800">{item.name}</span>
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
    <div className="grid max-h-48 gap-2 overflow-y-auto border border-zinc-200 p-3">
      {items.map((item) => (
        <label className="flex items-center gap-2 text-sm text-zinc-700" key={item.id}>
          <input defaultChecked={checkedIds.includes(item.id)} name={name} type="checkbox" value={item.id} />
          {item.name}
        </label>
      ))}
    </div>
  );
}

function ActionIcon({ label, tone }: Readonly<{ label: string; tone: "edit" | "view" }>) {
  const color = tone === "view" ? "text-blue-500" : "text-amber-500";

  return (
    <span className={`inline-flex items-center justify-center transition hover:scale-110 ${color}`} title={label}>
      {tone === "view" ? <ViewIcon /> : <EditIcon />}
    </span>
  );
}

function ViewIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="M3.5 12s3-5.5 8.5-5.5 8.5 5.5 8.5 5.5-3 5.5-8.5 5.5S3.5 12 3.5 12Z" stroke="currentColor" strokeWidth="2" />
      <path d="M12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="M4 16.8V20h3.2L18.7 8.5l-3.2-3.2L4 16.8Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" />
      <path d="m14.7 6.1 3.2 3.2" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="M5 7h14M10 11v6M14 11v6M8 7l.6 12h6.8L16 7M9.5 7l.8-2h3.4l.8 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

function brandLabel(company?: { legacy_code?: string | null; name: string; slug: string }) {
  if (!company) return "Sin marca";
  if (company.slug === "etn") return "ETN";
  if (company.slug === "gho") return "GHO";
  if (company.slug === "costaline") return "Costaline";

  return company.legacy_code || company.name;
}
