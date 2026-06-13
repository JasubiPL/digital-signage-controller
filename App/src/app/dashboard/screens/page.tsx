import { createScreen, deleteScreen } from "@/app/dashboard/actions";

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
import { SubmitButton } from "../submit-button";

type PageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function ScreensPage({ searchParams }: PageProps) {
  const [{ error, success }, { companies, supabase }] = await Promise.all([
    searchParams,
    getDashboardContext("/dashboard/screens"),
  ]);
  const companyIds = companies.map((company) => company.id);
  const [{ data: screens }, { data: locations }] = companyIds.length
    ? await Promise.all([
        supabase
          .from("screens")
          .select("id, company_id, location_id, name, device_identifier, status")
          .in("company_id", companyIds)
          .order("name", { ascending: true }),
        supabase
          .from("locations")
          .select("id, company_id, name")
          .in("company_id", companyIds)
          .order("name", { ascending: true }),
      ])
    : [{ data: [] }, { data: [] }];
  const companyById = new Map(companies.map((company) => [company.id, company]));
  const locationById = new Map((locations ?? []).map((location) => [location.id, location]));

  return (
    <div className="mx-auto flex w-full flex-col gap-8">
      <PageHeader eyebrow="Pantallas" title="Dispositivos y players" />
      <Feedback error={error} success={success} />

      <Panel title="Nueva pantalla">
        <form action={createScreen} className="grid gap-4 md:grid-cols-5">
          <Field label="Compañía">
            <select className={inputClass} name="companyId" required>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Ubicación">
            <select className={inputClass} name="locationId">
              <option value="">Sin ubicación</option>
              {(locations ?? []).map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Nombre">
            <input className={inputClass} name="name" required />
          </Field>
          <Field label="Identificador">
            <input className={inputClass} name="deviceIdentifier" placeholder="PLAYER-01" />
          </Field>
          <Field label="Estatus">
            <select className={inputClass} name="status">
              <option value="active">Activa</option>
              <option value="inactive">Inactiva</option>
              <option value="maintenance">Mantenimiento</option>
              <option value="archived">Archivada</option>
            </select>
          </Field>
          <div className="md:col-span-5">
            <SubmitButton className={buttonClass} pendingLabel="Creando...">
              Crear pantalla
            </SubmitButton>
          </div>
        </form>
      </Panel>

      <section className="grid gap-4">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 theme-dark:text-slate-100">
          Pantallas ({screens?.length ?? 0})
        </h2>
        {!screens?.length ? (
          <EmptyState>No hay pantallas disponibles para tus compañías.</EmptyState>
        ) : (
          <ListingTableShell>
            <table className={listingTableClass}>
              <thead className={listingHeadClass}>
                <tr>
                  <th className={listingHeaderCellClass}>Pantalla</th>
                  <th className={listingHeaderCellClass}>Compañía</th>
                  <th className={listingHeaderCellClass}>Ubicación</th>
                  <th className={listingHeaderCellClass}>Identificador</th>
                  <th className={listingHeaderCellClass}>Estatus</th>
                  <th className={`${listingHeaderCellClass} text-center`}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {screens.map((screen) => (
                  <tr className={listingRowClass} key={screen.id}>
                    <td className={`${listingCellClass} font-semibold text-slate-700 theme-dark:text-slate-100`}>{screen.name}</td>
                    <td className={listingCellClass}>{companyById.get(screen.company_id)?.name}</td>
                    <td className={listingCellClass}>
                      {screen.location_id
                        ? locationById.get(screen.location_id)?.name ?? "Sin dato"
                        : "Sin ubicación"}
                    </td>
                    <td className={listingCellClass}>{screen.device_identifier ?? "Sin dato"}</td>
                    <td className={listingCellClass}>
                      <ListingStatusBadge>{screen.status}</ListingStatusBadge>
                    </td>
                    <td className={listingActionCellClass}>
                      <form action={deleteScreen}>
                        <input name="id" type="hidden" value={screen.id} />
                        <input name="companyId" type="hidden" value={screen.company_id} />
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
