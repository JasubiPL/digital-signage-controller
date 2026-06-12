import {
  createCampaign,
  deleteCampaign,
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
import { formatDate, getDashboardContext } from "../data";

type PageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function CampaignsPage({ searchParams }: PageProps) {
  const [{ error, success }, { companies, supabase }] = await Promise.all([
    searchParams,
    getDashboardContext("/dashboard/campaigns"),
  ]);
  const companyIds = companies.map((company) => company.id);
  const { data: campaigns } = companyIds.length
    ? await supabase
        .from("campaigns")
        .select("id, company_id, name, starts_on, ends_on, status, created_at")
        .in("company_id", companyIds)
        .order("name", { ascending: true })
    : { data: [] };
  const companyById = new Map(companies.map((company) => [company.id, company]));

  return (
    <div className="mx-auto flex w-[95%] flex-col gap-6">
      <PageHeader eyebrow="Campanas" title="Administracion de campanas" />
      <Feedback error={error} success={success} />

      <Panel title="Nueva campania">
        <form action={createCampaign} className="grid gap-4 md:grid-cols-5">
          <Field label="Compania">
            <select className={inputClass} name="companyId" required>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Nombre">
            <input className={inputClass} name="name" required />
          </Field>
          <Field label="Inicio">
            <input className={inputClass} name="startsOn" type="date" />
          </Field>
          <Field label="Fin">
            <input className={inputClass} name="endsOn" type="date" />
          </Field>
          <Field label="Estatus">
            <select className={inputClass} name="status">
              <option value="draft">Borrador</option>
              <option value="active">Activa</option>
              <option value="inactive">Inactiva</option>
              <option value="archived">Archivada</option>
            </select>
          </Field>
          <div className="md:col-span-5">
            <button className={buttonClass}>Crear campania</button>
          </div>
        </form>
      </Panel>

      <Panel title={`Campanas (${campaigns?.length ?? 0})`}>
        {!campaigns?.length ? (
          <EmptyState>No hay campanas disponibles para tus companias.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-center text-sm">
              <thead className="border-b border-gray-200 font-semibold text-zinc-950">
                <tr>
                  <th className="py-2 pr-4 text-left">Campania</th>
                  <th className="py-2 pr-4">Compania</th>
                  <th className="py-2 pr-4">Inicio</th>
                  <th className="py-2 pr-4">Fin</th>
                  <th className="py-2 pr-4">Estatus</th>
                  <th className="py-2">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td className="py-3 pr-4 text-left font-medium text-zinc-950">{campaign.name}</td>
                    <td className="py-3 pr-4">{companyById.get(campaign.company_id)?.name}</td>
                    <td className="py-3 pr-4">{formatDate(campaign.starts_on)}</td>
                    <td className="py-3 pr-4">{formatDate(campaign.ends_on)}</td>
                    <td className="py-3 pr-4">
                      <StatusBadge>{campaign.status}</StatusBadge>
                    </td>
                    <td className="py-3">
                      <form action={deleteCampaign}>
                        <input name="id" type="hidden" value={campaign.id} />
                        <input name="companyId" type="hidden" value={campaign.company_id} />
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
