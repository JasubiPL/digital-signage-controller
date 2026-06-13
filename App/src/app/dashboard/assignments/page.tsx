import {
  assignCampaignToLocation,
  assignCampaignToScreen,
  deleteCampaignLocation,
  deleteCampaignScreen,
} from "@/app/dashboard/actions";

import {
  buttonClass,
  EmptyState,
  Feedback,
  Field,
  inputClass,
  PageHeader,
  Panel,
} from "../components";
import { getDashboardContext } from "../data";
import {
  DeleteActionButton,
  ListingStatusBadge,
  ListingTableShell,
  listingActionCellClass,
  listingCellClass,
  listingHeadClass,
  listingHeaderCellClass,
  listingRowClass,
  listingTableClass,
} from "../list-ui";

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
    <div className="mx-auto flex w-full flex-col gap-8">
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

      <section className="grid gap-4">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 theme-dark:text-slate-100">
          Campanas en ubicaciones ({campaignLocations?.length ?? 0})
        </h2>
        {!campaignLocations?.length ? (
          <EmptyState>No hay campanas asignadas a ubicaciones.</EmptyState>
        ) : (
          <ListingTableShell>
            <table className={listingTableClass}>
              <thead className={listingHeadClass}>
                <tr>
                  <th className={listingHeaderCellClass}>Campania</th>
                  <th className={listingHeaderCellClass}>Ubicacion</th>
                  <th className={listingHeaderCellClass}>Compania</th>
                  <th className={listingHeaderCellClass}>Estatus</th>
                  <th className={`${listingHeaderCellClass} text-center`}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {campaignLocations.map((assignment) => (
                  <tr className={listingRowClass} key={assignment.id}>
                    <td className={`${listingCellClass} font-semibold text-slate-700`}>
                      {campaignById.get(assignment.campaign_id)?.name ?? "Sin campania"}
                    </td>
                    <td className={listingCellClass}>
                      {locationById.get(assignment.location_id)?.name ?? "Sin ubicacion"}
                    </td>
                    <td className={listingCellClass}>{companyById.get(assignment.company_id)?.name}</td>
                    <td className={listingCellClass}>
                      <ListingStatusBadge>{assignment.status}</ListingStatusBadge>
                    </td>
                    <td className={listingActionCellClass}>
                      <form action={deleteCampaignLocation}>
                        <input name="id" type="hidden" value={assignment.id} />
                        <input name="companyId" type="hidden" value={assignment.company_id} />
                        <DeleteActionButton />
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ListingTableShell>
        )}
      </section>

      <section className="grid gap-4">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 theme-dark:text-slate-100">
          Campanas en pantallas ({campaignScreens?.length ?? 0})
        </h2>
        {!campaignScreens?.length ? (
          <EmptyState>No hay campanas asignadas a pantallas.</EmptyState>
        ) : (
          <ListingTableShell>
            <table className={listingTableClass}>
              <thead className={listingHeadClass}>
                <tr>
                  <th className={listingHeaderCellClass}>Campania</th>
                  <th className={listingHeaderCellClass}>Pantalla</th>
                  <th className={listingHeaderCellClass}>Compania</th>
                  <th className={listingHeaderCellClass}>Estatus</th>
                  <th className={`${listingHeaderCellClass} text-center`}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {campaignScreens.map((assignment) => (
                  <tr className={listingRowClass} key={assignment.id}>
                    <td className={`${listingCellClass} font-semibold text-slate-700`}>
                      {campaignById.get(assignment.campaign_id)?.name ?? "Sin campania"}
                    </td>
                    <td className={listingCellClass}>
                      {screenById.get(assignment.screen_id)?.name ?? "Sin pantalla"}
                    </td>
                    <td className={listingCellClass}>{companyById.get(assignment.company_id)?.name}</td>
                    <td className={listingCellClass}>
                      <ListingStatusBadge>{assignment.status}</ListingStatusBadge>
                    </td>
                    <td className={listingActionCellClass}>
                      <form action={deleteCampaignScreen}>
                        <input name="id" type="hidden" value={assignment.id} />
                        <input name="companyId" type="hidden" value={assignment.company_id} />
                        <DeleteActionButton />
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ListingTableShell>
        )}
      </section>
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
