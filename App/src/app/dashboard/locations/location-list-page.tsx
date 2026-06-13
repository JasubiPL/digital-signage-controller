import { notFound } from "next/navigation";

import { createLocation, deleteLocation } from "@/app/dashboard/actions";

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

type LocationListPageProps = {
  companySlug?: string;
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export async function LocationListPage({
  companySlug,
  searchParams,
}: Readonly<LocationListPageProps>) {
  const next = companySlug
    ? `/dashboard/locations/${companySlug}`
    : "/dashboard/locations";
  const [{ error, success }, { companies, supabase }] = await Promise.all([
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
  const { data: locations } = companyIds.length
    ? await supabase
        .from("locations")
        .select("id, company_id, name, device, projection, status")
        .in("company_id", companyIds)
        .order("name", { ascending: true })
    : { data: [] };
  const companyById = new Map(companies.map((company) => [company.id, company]));
  const brandName = selectedCompany ? brandLabel(selectedCompany) : null;

  return (
    <div className="mx-auto flex w-[95%] flex-col gap-6">
      <PageHeader
        eyebrow="Taquillas"
        title={brandName ? `Taquillas ${brandName}` : "Taquillas por marca"}
      />
      <Feedback error={error} success={success} />

      <Panel title={brandName ? `Nueva taquilla ${brandName}` : "Nueva taquilla"}>
        <form action={createLocation} className="grid gap-4 md:grid-cols-5">
          <input name="returnPath" type="hidden" value={next} />
          <Field label="Marca">
            <select className={inputClass} name="companyId" required>
              {availableCompanies.map((company) => (
                <option key={company.id} value={company.id}>
                  {brandLabel(company)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Nombre">
            <input className={inputClass} name="name" required />
          </Field>
          <Field label="Dispositivo">
            <input className={inputClass} name="device" placeholder="Pantallas, LED..." />
          </Field>
          <Field label="Proyeccion">
            <input className={inputClass} name="projection" placeholder="Player, USB..." />
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
            <button className={buttonClass}>Crear taquilla</button>
          </div>
        </form>
      </Panel>

      <Panel title={`Taquillas (${locations?.length ?? 0})`}>
        {!locations?.length ? (
          <EmptyState>
            {brandName
              ? `No hay taquillas disponibles para ${brandName}.`
              : "No hay taquillas disponibles para tus marcas."}
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-center text-sm">
              <thead className="border-b border-gray-200 font-semibold text-zinc-950">
                <tr>
                  <th className="py-2 pr-4 text-left">Taquilla</th>
                  <th className="py-2 pr-4">Marca</th>
                  <th className="py-2 pr-4">Dispositivo</th>
                  <th className="py-2 pr-4">Proyeccion</th>
                  <th className="py-2 pr-4">Estatus</th>
                  <th className="py-2">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {locations.map((location) => (
                  <tr key={location.id}>
                    <td className="py-3 pr-4 text-left font-medium text-zinc-950">
                      {location.name}
                    </td>
                    <td className="py-3 pr-4">
                      {brandLabel(companyById.get(location.company_id))}
                    </td>
                    <td className="py-3 pr-4">{location.device ?? "Sin dato"}</td>
                    <td className="py-3 pr-4">{location.projection ?? "Sin dato"}</td>
                    <td className="py-3 pr-4">
                      <StatusBadge>{location.status}</StatusBadge>
                    </td>
                    <td className="py-3">
                      <form action={deleteLocation}>
                        <input name="returnPath" type="hidden" value={next} />
                        <input name="id" type="hidden" value={location.id} />
                        <input name="companyId" type="hidden" value={location.company_id} />
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

function brandLabel(company?: { legacy_code?: string | null; name: string; slug: string }) {
  if (!company) return "Sin marca";
  if (company.slug === "etn") return "ETN";
  if (company.slug === "gho") return "GHO";
  if (company.slug === "costaline") return "Costaline";

  return company.legacy_code || company.name;
}
