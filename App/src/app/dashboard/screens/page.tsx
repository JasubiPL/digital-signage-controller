import { createScreen, deleteScreen } from "@/app/dashboard/actions";

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
    <div className="mx-auto flex w-[95%] flex-col gap-6">
      <PageHeader eyebrow="Pantallas" title="Dispositivos y players" />
      <Feedback error={error} success={success} />

      <Panel title="Nueva pantalla">
        <form action={createScreen} className="grid gap-4 md:grid-cols-5">
          <Field label="Compania">
            <select className={inputClass} name="companyId" required>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Ubicacion">
            <select className={inputClass} name="locationId">
              <option value="">Sin ubicacion</option>
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
            <button className={buttonClass}>Crear pantalla</button>
          </div>
        </form>
      </Panel>

      <Panel title={`Pantallas (${screens?.length ?? 0})`}>
        {!screens?.length ? (
          <EmptyState>No hay pantallas disponibles para tus companias.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-center text-sm">
              <thead className="border-b border-gray-200 font-semibold text-zinc-950">
                <tr>
                  <th className="py-2 pr-4 text-left">Pantalla</th>
                  <th className="py-2 pr-4">Compania</th>
                  <th className="py-2 pr-4">Ubicacion</th>
                  <th className="py-2 pr-4">Identificador</th>
                  <th className="py-2 pr-4">Estatus</th>
                  <th className="py-2">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {screens.map((screen) => (
                  <tr key={screen.id}>
                    <td className="py-3 pr-4 text-left font-medium text-zinc-950">{screen.name}</td>
                    <td className="py-3 pr-4">{companyById.get(screen.company_id)?.name}</td>
                    <td className="py-3 pr-4">
                      {screen.location_id
                        ? locationById.get(screen.location_id)?.name ?? "Sin dato"
                        : "Sin ubicacion"}
                    </td>
                    <td className="py-3 pr-4">{screen.device_identifier ?? "Sin dato"}</td>
                    <td className="py-3 pr-4">
                      <StatusBadge>{screen.status}</StatusBadge>
                    </td>
                    <td className="py-3">
                      <form action={deleteScreen}>
                        <input name="id" type="hidden" value={screen.id} />
                        <input name="companyId" type="hidden" value={screen.company_id} />
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
