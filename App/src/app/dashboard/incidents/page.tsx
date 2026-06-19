import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FiAlertTriangle,
  FiClock,
  FiShield,
} from "react-icons/fi";

import {
  deleteLocationIncident,
} from "@/app/dashboard/actions";

import {
  buttonClass,
  EmptyState,
  Feedback,
  Field,
  inputClass,
  PageHeader,
} from "../components";
import { getDashboardContext } from "../data";
import { DashboardDialog } from "../dialog";
import {
  CreateIncidentForm,
} from "./incident-client-forms";
import {
  ActionIconTrigger,
  DeleteActionButton,
  ListingPrimaryAction,
  ListingTableShell,
  listingActionCellClass,
  listingCellClass,
  listingHeadClass,
  listingHeaderCellClass,
  listingRowClass,
  listingTableClass,
} from "../list-ui";

type IncidentsPageProps = {
  searchParams: Promise<{
    category?: string;
    companyId?: string;
    error?: string;
    locationId?: string;
    newIncidentLocation?: string;
    priority?: string;
    status?: string;
    success?: string;
  }>;
};

type Company = {
  id: string;
  legacy_code?: string | null;
  name: string;
  slug: string;
};

type Location = {
  company_id: string;
  id: string;
  name: string;
};

type Incident = {
  assignee_name: string | null;
  category: string;
  company_id: string;
  created_at: string;
  description: string;
  id: string;
  location_id: string;
  opened_at: string;
  priority: string;
  reported_by: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_summary: string | null;
  status: string;
  title: string;
  updated_at: string;
};

const incidentStatuses = ["open", "in_progress", "waiting", "resolved", "canceled"];
const incidentPriorities = ["low", "medium", "high", "critical"];
const incidentCategories = [
  "screen_issue",
  "player_offline",
  "content_not_loading",
  "usb_issue",
  "streaming_issue",
  "physical_damage",
  "remodeling_operation",
  "other",
];
const activeStatuses = ["open", "in_progress", "waiting"];

export default async function IncidentsPage({
  searchParams,
}: Readonly<IncidentsPageProps>) {
  const [{ error, success, ...filters }, { access, companies, supabase }] =
    await Promise.all([
      searchParams,
      getDashboardContext("/dashboard/incidents"),
    ]);

  if (!access.canAccessIncidents) {
    notFound();
  }

  const companyIds = companies.map((company) => company.id);
  const selectedCompanyId = companyIds.includes(filters.companyId ?? "")
    ? filters.companyId
    : "";
  const scopedCompanyIds = selectedCompanyId ? [selectedCompanyId] : companyIds;

  // Resolve the taquilla filter through the junction table.
  let incidentIdFilter: string[] | null | undefined;
  if (companyIds.length && filters.locationId) {
    const { data: filterLinks } = await supabase
      .from("location_incident_locations")
      .select("incident_id")
      .in("company_id", scopedCompanyIds)
      .eq("location_id", filters.locationId);
    const matchedIds = Array.from(
      new Set((filterLinks ?? []).map((link) => link.incident_id as string)),
    );
    incidentIdFilter = matchedIds.length ? matchedIds : null;
  }

  const [{ data: locations }, incidentResult] = companyIds.length
    ? await Promise.all([
        supabase
          .from("locations")
          .select("id, company_id, name")
          .in("company_id", scopedCompanyIds)
          .order("name", { ascending: true }),
        loadIncidents(supabase, {
          category: validOption(filters.category, incidentCategories),
          companyIds,
          companyId: selectedCompanyId,
          incidentIds: incidentIdFilter,
          priority: validOption(filters.priority, incidentPriorities),
          status: validOption(filters.status, incidentStatuses),
        }),
      ])
    : [{ data: [] }, { data: [] }];
  const incidents = (incidentResult.data ?? []) as Incident[];
  const typedLocations = (locations ?? []) as Location[];
  const companyById = new Map(companies.map((company) => [company.id, company]));
  const locationById = new Map(typedLocations.map((location) => [location.id, location]));

  // Map every incident to the names of all its taquillas.
  const incidentIds = incidents.map((incident) => incident.id);
  const { data: incidentLinks } = incidentIds.length
    ? await supabase
        .from("location_incident_locations")
        .select("incident_id, location_id")
        .in("incident_id", incidentIds)
    : { data: [] };
  const locationNamesByIncident = new Map<string, string[]>();
  for (const link of (incidentLinks ?? []) as { incident_id: string; location_id: string }[]) {
    const name = locationById.get(link.location_id)?.name;
    if (!name) continue;
    const current = locationNamesByIncident.get(link.incident_id) ?? [];
    current.push(name);
    locationNamesByIncident.set(link.incident_id, current);
  }
  const createForLocationId = typedLocations.some(
    (location) => location.id === filters.newIncidentLocation,
  )
    ? filters.newIncidentLocation
    : undefined;

  return (
    <div className="mx-auto flex w-full flex-col gap-6">
      <Feedback error={error} success={success} />

      <PageHeader eyebrow="Incidentes" title="Seguimiento de taquillas">
        {access.isGlobalAdmin ? (
          <DashboardDialog
            defaultOpen={Boolean(createForLocationId)}
            title="Nuevo incidente"
            trigger={<ListingPrimaryAction>Nuevo Incidente +</ListingPrimaryAction>}
          >
            <CreateIncidentForm
              companies={companies}
              defaultLocationId={createForLocationId}
              locations={typedLocations}
            />
          </DashboardDialog>
        ) : null}
      </PageHeader>

      <section className="grid gap-4 md:grid-cols-4">
        <IncidentMetric
          icon={<FiAlertTriangle aria-hidden="true" />}
          label="Abiertos"
          value={incidents.filter((incident) => incident.status === "open").length}
        />
        <IncidentMetric
          icon={<FiClock aria-hidden="true" />}
          label="En proceso"
          value={incidents.filter((incident) => incident.status === "in_progress").length}
        />
        <IncidentMetric
          icon={<FiShield aria-hidden="true" />}
          label="En espera"
          value={incidents.filter((incident) => incident.status === "waiting").length}
        />
        <IncidentMetric
          icon={<FiAlertTriangle aria-hidden="true" />}
          label="Criticos"
          value={incidents.filter((incident) => incident.priority === "critical" && activeStatuses.includes(incident.status)).length}
        />
      </section>

      <IncidentFilters
        companies={companies}
        filters={filters}
        locations={typedLocations}
      />

      {!incidents.length ? (
        <EmptyState>No hay incidentes con los filtros seleccionados.</EmptyState>
      ) : (
        <ListingTableShell>
          <table className={listingTableClass}>
            <thead className={listingHeadClass}>
              <tr>
                <th className={listingHeaderCellClass}>Incidente</th>
                <th className={listingHeaderCellClass}>Marca</th>
                <th className={listingHeaderCellClass}>Taquilla</th>
                <th className={listingHeaderCellClass}>Prioridad</th>
                <th className={listingHeaderCellClass}>Estado</th>
                <th className={listingHeaderCellClass}>Responsable</th>
                <th className={`${listingHeaderCellClass} text-center`}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((incident) => (
                <tr className={listingRowClass} key={incident.id}>
                  <td className={`${listingCellClass} min-w-72`}>
                    <p className="font-semibold text-[var(--color-text-primary)]">{incident.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-[var(--color-text-muted)]">
                      {categoryLabel(incident.category)} · Actualizado {formatDateTime(incident.updated_at)}
                    </p>
                  </td>
                  <td className={listingCellClass}>
                    {brandLabel(companyById.get(incident.company_id))}
                  </td>
                  <td className={listingCellClass}>
                    {(() => {
                      const names = locationNamesByIncident.get(incident.id) ?? [];
                      if (!names.length) return "Sin taquilla";
                      if (names.length <= 2) return names.join(", ");

                      return `${names.slice(0, 2).join(", ")} +${names.length - 2}`;
                    })()}
                  </td>
                  <td className={listingCellClass}>
                    <IncidentBadge value={incident.priority} />
                  </td>
                  <td className={listingCellClass}>
                    <IncidentBadge value={incident.status} />
                  </td>
                  <td className={listingCellClass}>
                    {incident.assignee_name || "Sin asignar"}
                  </td>
                  <td className={listingActionCellClass}>
                    <div className="flex justify-center gap-2">
                      <Link href={`/dashboard/incidents/${incident.id}`}>
                        <ActionIconTrigger label="Ver incidente" tone="view" />
                      </Link>
                      {access.isGlobalAdmin ? (
                        <form action={deleteLocationIncident}>
                          <input name="returnPath" type="hidden" value="/dashboard/incidents" />
                          <input name="id" type="hidden" value={incident.id} />
                          <DeleteActionButton label={`Eliminar ${incident.title}`} />
                        </form>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ListingTableShell>
      )}
    </div>
  );
}

async function loadIncidents(
  supabase: Awaited<ReturnType<typeof getDashboardContext>>["supabase"],
  filters: {
    category?: string;
    companyId?: string;
    companyIds: string[];
    incidentIds?: string[] | null;
    priority?: string;
    status?: string;
  },
) {
  // A null incidentIds means the location filter matched no incidents.
  if (filters.incidentIds === null) return { data: [] };

  let query = supabase
    .from("location_incidents")
    .select("id, company_id, location_id, title, description, category, priority, status, assignee_name, reported_by, resolved_by, opened_at, resolved_at, resolution_summary, created_at, updated_at")
    .in("company_id", filters.companyId ? [filters.companyId] : filters.companyIds)
    .order("updated_at", { ascending: false });

  if (filters.incidentIds) query = query.in("id", filters.incidentIds);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.priority) query = query.eq("priority", filters.priority);
  if (filters.category) query = query.eq("category", filters.category);

  return query;
}

function IncidentFilters({
  companies,
  filters,
  locations,
}: Readonly<{
  companies: Company[];
  filters: {
    category?: string;
    companyId?: string;
    locationId?: string;
    priority?: string;
    status?: string;
  };
  locations: Location[];
}>) {
  return (
    <form className="glass-panel grid gap-4 rounded-lg p-4 md:grid-cols-6">
      <Field label="Marca">
        <select className={inputClass} defaultValue={filters.companyId ?? ""} name="companyId">
          <option value="">Todas</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {brandLabel(company)}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Taquilla">
        <select className={inputClass} defaultValue={filters.locationId ?? ""} name="locationId">
          <option value="">Todas</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Estado">
        <select className={inputClass} defaultValue={filters.status ?? ""} name="status">
          <option value="">Todos</option>
          {incidentStatuses.map((status) => (
            <option key={status} value={status}>
              {statusLabel(status)}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Prioridad">
        <select className={inputClass} defaultValue={filters.priority ?? ""} name="priority">
          <option value="">Todas</option>
          {incidentPriorities.map((priority) => (
            <option key={priority} value={priority}>
              {priorityLabel(priority)}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Categoria">
        <select className={inputClass} defaultValue={filters.category ?? ""} name="category">
          <option value="">Todas</option>
          {incidentCategories.map((category) => (
            <option key={category} value={category}>
              {categoryLabel(category)}
            </option>
          ))}
        </select>
      </Field>
      <div className="flex items-end gap-2">
        <button className={buttonClass} type="submit">Filtrar</button>
      </div>
    </form>
  );
}

function IncidentMetric({
  icon,
  label,
  value,
}: Readonly<{
  icon: React.ReactNode;
  label: string;
  value: number;
}>) {
  return (
    <article className="glass-panel relative min-h-28 overflow-hidden rounded-lg px-5 py-4">
      <div className="absolute right-4 top-4 text-5xl text-[rgba(148,163,184,0.08)]">
        {icon}
      </div>
      <p className="mono-label relative text-xs font-extrabold text-[var(--color-primary)]">{label}</p>
      <p className="relative mt-3 font-display text-4xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
        {value}
      </p>
    </article>
  );
}

function IncidentBadge({ value }: Readonly<{ value: string }>) {
  const tone =
    value === "critical" || value === "open"
      ? "border-[rgba(244,63,94,0.34)] bg-[var(--color-secondary-muted)] text-[var(--color-secondary-soft)]"
      : value === "high" || value === "waiting"
        ? "border-[rgba(255,177,59,0.34)] bg-[var(--color-tertiary-muted)] text-[var(--color-tertiary-soft)]"
        : value === "resolved"
          ? "border-[var(--color-primary-border)] bg-[var(--color-primary-muted)] text-[var(--color-primary-soft)]"
          : "border-[var(--color-border)] bg-[rgba(148,163,184,0.08)] text-[var(--color-text-soft)]";

  return (
    <span className={`inline-flex min-w-28 items-center justify-center gap-2 rounded-full border px-3 py-1.5 font-mono text-xs font-extrabold ${tone}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {statusLabel(value) || priorityLabel(value) || value}
    </span>
  );
}

function validOption(value: string | undefined, options: string[]) {
  return value && options.includes(value) ? value : undefined;
}

function brandLabel(company?: Company) {
  if (!company) return "Sin marca";

  return company.legacy_code || company.name;
}

function categoryLabel(value: string) {
  const labels: Record<string, string> = {
    content_not_loading: "Contenido sin cargar",
    other: "Otro",
    physical_damage: "Dano fisico",
    player_offline: "Player offline",
    remodeling_operation: "Remodelacion",
    screen_issue: "Pantalla",
    streaming_issue: "Streaming",
    usb_issue: "USB",
  };

  return labels[value] ?? value;
}

function priorityLabel(value: string) {
  const labels: Record<string, string> = {
    critical: "Critica",
    high: "Alta",
    low: "Baja",
    medium: "Media",
  };

  return labels[value] ?? "";
}

function statusLabel(value: string) {
  const labels: Record<string, string> = {
    canceled: "Cancelado",
    in_progress: "En proceso",
    open: "Abierto",
    resolved: "Resuelto",
    waiting: "En espera",
  };

  return labels[value] ?? "";
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
