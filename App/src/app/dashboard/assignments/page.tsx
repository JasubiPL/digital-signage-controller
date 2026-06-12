import {
  assignCampaignToLocation,
  assignCampaignToScreen,
  deleteCampaignLocation,
  deleteCampaignScreen,
} from "@/app/dashboard/actions";

import {
  buttonClass,
  dangerButtonClass,
  EmptyState,
  Feedback,
  Field,
  inputClass,
  PageHeader,
  Panel,
  StatusBadge,
} from "../components";
import { getDashboardContext } from "../data";

type PageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function AssignmentsPage({ searchParams }: PageProps) {
  const [{ error, success }, { companies, supabase }] = await Promise.all([
    searchParams,
    getDashboardContext("/dashboard/assignments"),
  ]);
  const companyIds = companies.map((company) => company.id);
  const [
    { data: campaigns },
    { data: locations },
    { data: screens },
    { data: campaignLocations },
    { data: campaignScreens },
  ] = companyIds.length
    ? await Promise.all([
        supabase
          .from("campaigns")
          .select("id, company_id, name")
          .in("company_id", companyIds)
          .order("name", { ascending: true }),
        supabase
          .from("locations")
          .select("id, company_id, name")
          .in("company_id", companyIds)
          .order("name", { ascending: true }),
        supabase
          .from("screens")
          .select("id, company_id, name")
          .in("company_id", companyIds)
          .order("name", { ascending: true }),
        supabase
          .from("campaign_locations")
          .select("id, company_id, campaign_id, location_id, status")
          .in("company_id", companyIds)
          .order("created_at", { ascending: false }),
        supabase
          .from("campaign_screens")
          .select("id, company_id, campaign_id, screen_id, status")
          .in("company_id", companyIds)
          .order("created_at", { ascending: false }),
      ])
    : [
        { data: [] },
        { data: [] },
        { data: [] },
        { data: [] },
        { data: [] },
      ];
  const companyById = new Map(companies.map((company) => [company.id, company]));
  const campaignById = new Map((campaigns ?? []).map((campaign) => [campaign.id, campaign]));
  const locationById = new Map((locations ?? []).map((location) => [location.id, location]));
  const screenById = new Map((screens ?? []).map((screen) => [screen.id, screen]));

  return (
    <div className="mx-auto flex w-[95%] flex-col gap-6">
      <PageHeader eyebrow="Asignaciones" title="Campanas por ubicacion y pantalla" />
      <Feedback error={error} success={success} />

      <section className="grid gap-6 lg:grid-cols-2">
        <Panel title="Asignar campania a ubicacion">
          <form action={assignCampaignToLocation} className="grid gap-4">
            <AssignmentCompanySelect companies={companies} />
            <Field label="Campania">
              <select className={inputClass} name="campaignId" required>
                {(campaigns ?? []).map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Ubicacion">
              <select className={inputClass} name="locationId" required>
                {(locations ?? []).map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </Field>
            <button className={buttonClass}>Asignar a ubicacion</button>
          </form>
        </Panel>

        <Panel title="Asignar campania a pantalla">
          <form action={assignCampaignToScreen} className="grid gap-4">
            <AssignmentCompanySelect companies={companies} />
            <Field label="Campania">
              <select className={inputClass} name="campaignId" required>
                {(campaigns ?? []).map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Pantalla">
              <select className={inputClass} name="screenId" required>
                {(screens ?? []).map((screen) => (
                  <option key={screen.id} value={screen.id}>
                    {screen.name}
                  </option>
                ))}
              </select>
            </Field>
            <button className={buttonClass}>Asignar a pantalla</button>
          </form>
        </Panel>
      </section>

      <Panel title={`Campanas en ubicaciones (${campaignLocations?.length ?? 0})`}>
        {!campaignLocations?.length ? (
          <EmptyState>No hay campanas asignadas a ubicaciones.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-center text-sm">
              <thead className="border-b border-gray-200 font-semibold text-zinc-950">
                <tr>
                  <th className="py-2 pr-4 text-left">Campania</th>
                  <th className="py-2 pr-4">Ubicacion</th>
                  <th className="py-2 pr-4">Compania</th>
                  <th className="py-2 pr-4">Estatus</th>
                  <th className="py-2">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {campaignLocations.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="py-3 pr-4 text-left font-medium">
                      {campaignById.get(assignment.campaign_id)?.name ?? "Sin campania"}
                    </td>
                    <td className="py-3 pr-4">
                      {locationById.get(assignment.location_id)?.name ?? "Sin ubicacion"}
                    </td>
                    <td className="py-3 pr-4">{companyById.get(assignment.company_id)?.name}</td>
                    <td className="py-3 pr-4">
                      <StatusBadge>{assignment.status}</StatusBadge>
                    </td>
                    <td className="py-3">
                      <form action={deleteCampaignLocation}>
                        <input name="id" type="hidden" value={assignment.id} />
                        <input name="companyId" type="hidden" value={assignment.company_id} />
                        <button className={dangerButtonClass}>Eliminar</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel title={`Campanas en pantallas (${campaignScreens?.length ?? 0})`}>
        {!campaignScreens?.length ? (
          <EmptyState>No hay campanas asignadas a pantallas.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-center text-sm">
              <thead className="border-b border-gray-200 font-semibold text-zinc-950">
                <tr>
                  <th className="py-2 pr-4 text-left">Campania</th>
                  <th className="py-2 pr-4">Pantalla</th>
                  <th className="py-2 pr-4">Compania</th>
                  <th className="py-2 pr-4">Estatus</th>
                  <th className="py-2">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {campaignScreens.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="py-3 pr-4 text-left font-medium">
                      {campaignById.get(assignment.campaign_id)?.name ?? "Sin campania"}
                    </td>
                    <td className="py-3 pr-4">
                      {screenById.get(assignment.screen_id)?.name ?? "Sin pantalla"}
                    </td>
                    <td className="py-3 pr-4">{companyById.get(assignment.company_id)?.name}</td>
                    <td className="py-3 pr-4">
                      <StatusBadge>{assignment.status}</StatusBadge>
                    </td>
                    <td className="py-3">
                      <form action={deleteCampaignScreen}>
                        <input name="id" type="hidden" value={assignment.id} />
                        <input name="companyId" type="hidden" value={assignment.company_id} />
                        <button className={dangerButtonClass}>Eliminar</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

function AssignmentCompanySelect({
  companies,
}: Readonly<{
  companies: Array<{ id: string; name: string }>;
}>) {
  return (
    <Field label="Compania">
      <select className={inputClass} name="companyId" required>
        {companies.map((company) => (
          <option key={company.id} value={company.id}>
            {company.name}
          </option>
        ))}
      </select>
    </Field>
  );
}
