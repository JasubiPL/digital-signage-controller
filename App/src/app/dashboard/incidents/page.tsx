import Image from "next/image";
import { notFound } from "next/navigation";
import {
  FiAlertTriangle,
  FiClock,
  FiImage,
  FiMessageSquare,
  FiShield,
} from "react-icons/fi";

import {
  deleteIncidentAttachment,
  updateLocationIncident,
} from "@/app/dashboard/actions";

import {
  buttonClass,
  dangerButtonClass,
  EmptyState,
  Feedback,
  Field,
  inputClass,
  PageHeader,
} from "../components";
import { getDashboardContext } from "../data";
import { DashboardDialog } from "../dialog";
import {
  AddNoteForm,
  CreateIncidentForm,
  UploadIncidentAttachmentForm,
} from "./incident-client-forms";
import {
  ActionIconTrigger,
  ListingPrimaryAction,
  ListingTableShell,
  listingActionCellClass,
  listingCellClass,
  listingHeadClass,
  listingHeaderCellClass,
  listingRowClass,
  listingTableClass,
} from "../list-ui";
import { SubmitButton } from "../submit-button";

type IncidentsPageProps = {
  searchParams: Promise<{
    category?: string;
    companyId?: string;
    error?: string;
    locationId?: string;
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

type IncidentNote = {
  author_id: string | null;
  body: string;
  company_id: string;
  created_at: string;
  event_type: string;
  id: string;
  incident_id: string;
  location_id: string;
};

type IncidentAttachment = {
  caption: string | null;
  company_id: string;
  created_at: string;
  id: string;
  incident_id: string;
  location_id: string;
  mime_type: string;
  note_id: string | null;
  original_name: string;
  size_bytes: number;
  status: string;
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
  const [{ data: locations }, incidentResult] = companyIds.length
    ? await Promise.all([
        supabase
          .from("locations")
          .select("id, company_id, name")
          .in("company_id", selectedCompanyId ? [selectedCompanyId] : companyIds)
          .order("name", { ascending: true }),
        loadIncidents(supabase, {
          category: validOption(filters.category, incidentCategories),
          companyIds,
          companyId: selectedCompanyId,
          locationId: filters.locationId,
          priority: validOption(filters.priority, incidentPriorities),
          status: validOption(filters.status, incidentStatuses),
        }),
      ])
    : [{ data: [] }, { data: [] }];
  const incidents = (incidentResult.data ?? []) as Incident[];
  const incidentIds = incidents.map((incident) => incident.id);
  const [{ data: notes }, { data: attachments }] = incidentIds.length
    ? await Promise.all([
        supabase
          .from("location_incident_notes")
          .select("id, incident_id, company_id, location_id, author_id, body, event_type, created_at")
          .in("incident_id", incidentIds)
          .order("created_at", { ascending: true }),
        supabase
          .from("location_incident_attachments")
          .select("id, incident_id, note_id, company_id, location_id, original_name, mime_type, size_bytes, caption, status, created_at")
          .in("incident_id", incidentIds)
          .eq("status", "active")
          .order("created_at", { ascending: true }),
      ])
    : [{ data: [] }, { data: [] }];
  const typedLocations = (locations ?? []) as Location[];
  const typedNotes = (notes ?? []) as IncidentNote[];
  const typedAttachments = (attachments ?? []) as IncidentAttachment[];
  const companyById = new Map(companies.map((company) => [company.id, company]));
  const locationById = new Map(typedLocations.map((location) => [location.id, location]));
  const notesByIncident = groupBy(typedNotes, "incident_id");
  const attachmentsByIncident = groupBy(typedAttachments, "incident_id");
  const attachmentsByNote = groupBy(
    typedAttachments.filter((attachment) => attachment.note_id),
    "note_id",
  );

  return (
    <div className="mx-auto flex w-full flex-col gap-6">
      <Feedback error={error} success={success} />

      <PageHeader eyebrow="Incidentes" title="Seguimiento de taquillas">
        {access.isGlobalAdmin ? (
          <DashboardDialog
            title="Nuevo incidente"
            trigger={<ListingPrimaryAction>Nuevo Incidente +</ListingPrimaryAction>}
          >
            <CreateIncidentForm
              companies={companies}
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
                    {locationById.get(incident.location_id)?.name ?? "Sin taquilla"}
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
                    <div className="flex justify-center">
                      <DashboardDialog
                        title={incident.title}
                        trigger={<ActionIconTrigger label="Ver incidente" tone="view" />}
                      >
                        <IncidentDetail
                          attachments={attachmentsByIncident.get(incident.id) ?? []}
                          attachmentsByNote={attachmentsByNote}
                          canManage={access.isGlobalAdmin}
                          companies={companies}
                          incident={incident}
                          location={locationById.get(incident.location_id)}
                          notes={notesByIncident.get(incident.id) ?? []}
                        />
                      </DashboardDialog>
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
    locationId?: string;
    priority?: string;
    status?: string;
  },
) {
  let query = supabase
    .from("location_incidents")
    .select("id, company_id, location_id, title, description, category, priority, status, assignee_name, reported_by, resolved_by, opened_at, resolved_at, resolution_summary, created_at, updated_at")
    .in("company_id", filters.companyId ? [filters.companyId] : filters.companyIds)
    .order("updated_at", { ascending: false });

  if (filters.locationId) query = query.eq("location_id", filters.locationId);
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

function IncidentDetail({
  attachments,
  attachmentsByNote,
  canManage,
  companies,
  incident,
  location,
  notes,
}: Readonly<{
  attachments: IncidentAttachment[];
  attachmentsByNote: Map<string | null, IncidentAttachment[]>;
  canManage: boolean;
  companies: Company[];
  incident: Incident;
  location?: Location;
  notes: IncidentNote[];
}>) {
  const incidentAttachments = attachments.filter((attachment) => !attachment.note_id);

  return (
    <section className="grid gap-6">
      <div className="grid gap-3 rounded-lg border border-[var(--color-border)] bg-[rgba(2,6,23,0.34)] p-4 text-sm text-[var(--color-text-secondary)]">
        <div className="flex flex-wrap gap-2">
          <IncidentBadge value={incident.status} />
          <IncidentBadge value={incident.priority} />
          <span className="rounded-full border border-[var(--color-border)] px-3 py-1.5 font-mono text-xs font-extrabold text-[var(--color-text-soft)]">
            {categoryLabel(incident.category)}
          </span>
        </div>
        <p className="leading-6">{incident.description}</p>
        <p className="font-mono text-xs text-[var(--color-text-muted)]">
          {brandLabel(companies.find((company) => company.id === incident.company_id))} · {location?.name ?? "Sin taquilla"} · Abierto {formatDateTime(incident.opened_at)}
        </p>
        {incident.resolution_summary ? (
          <p className="rounded-md border border-[var(--color-primary-border)] bg-[var(--color-primary-muted)] px-4 py-3 text-sm font-semibold text-[var(--color-primary-soft)]">
            Resolucion: {incident.resolution_summary}
          </p>
        ) : null}
      </div>

      {canManage ? (
        <AdminIncidentForm incident={incident} />
      ) : null}

      {canManage ? (
        <UploadIncidentAttachmentForm incidentId={incident.id} />
      ) : null}

      <AttachmentGallery
        attachments={incidentAttachments}
        canManage={canManage}
      />

      <section className="grid gap-3">
        <h3 className="font-display text-lg font-extrabold text-[var(--color-text-primary)]">
          Comentarios y seguimiento
        </h3>
        <AddNoteForm incidentId={incident.id} />
        {!notes.length ? (
          <EmptyState>No hay comentarios registrados.</EmptyState>
        ) : (
          <div className="grid gap-3">
            {notes.map((note) => (
              <article
                className="rounded-lg border border-[var(--color-border)] bg-[rgba(2,6,23,0.34)] p-4"
                key={note.id}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 font-mono text-xs font-extrabold text-[var(--color-primary)]">
                    <FiMessageSquare aria-hidden="true" />
                    {eventLabel(note.event_type)}
                  </span>
                  <time className="font-mono text-xs text-[var(--color-text-muted)]">
                    {formatDateTime(note.created_at)}
                  </time>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm font-semibold leading-6 text-[var(--color-text-secondary)]">
                  {note.body}
                </p>
                <AttachmentGallery
                  attachments={attachmentsByNote.get(note.id) ?? []}
                  canManage={canManage}
                  compact
                />
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

function AdminIncidentForm({ incident }: Readonly<{ incident: Incident }>) {
  return (
    <form action={updateLocationIncident} className="grid gap-4 rounded-lg border border-[var(--color-border)] p-4">
      <input name="returnPath" type="hidden" value="/dashboard/incidents" />
      <input name="id" type="hidden" value={incident.id} />
      <Field label="Titulo">
        <input className={inputClass} defaultValue={incident.title} name="title" required />
      </Field>
      <Field label="Descripcion">
        <textarea className={inputClass} defaultValue={incident.description} name="description" required rows={3} />
      </Field>
      <section className="grid gap-4 md:grid-cols-4">
        <CategoryField defaultValue={incident.category} />
        <PriorityField defaultValue={incident.priority} />
        <StatusField defaultValue={incident.status} />
        <Field label="Responsable">
          <input className={inputClass} defaultValue={incident.assignee_name ?? ""} name="assigneeName" />
        </Field>
      </section>
      <Field label="Resumen de resolucion">
        <textarea className={inputClass} defaultValue={incident.resolution_summary ?? ""} name="resolutionSummary" rows={2} />
      </Field>
      <Field label="Nota opcional">
        <textarea className={inputClass} name="note" rows={2} />
      </Field>
      <SubmitButton className={buttonClass} pendingLabel="Guardando...">
        Guardar incidente
      </SubmitButton>
    </form>
  );
}

function AttachmentGallery({
  attachments,
  canManage,
  compact = false,
}: Readonly<{
  attachments: IncidentAttachment[];
  canManage: boolean;
  compact?: boolean;
}>) {
  if (!attachments.length) return null;

  return (
    <section className={`grid gap-3 ${compact ? "mt-4 grid-cols-2" : "grid-cols-2 md:grid-cols-3"}`}>
      {attachments.map((attachment) => (
        <figure
          className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[rgba(2,6,23,0.5)]"
          key={attachment.id}
        >
          <a href={`/api/incident-attachments/${attachment.id}`} rel="noreferrer" target="_blank">
            <Image
              alt={attachment.caption || attachment.original_name}
              className="h-36 w-full object-cover"
              height={144}
              src={`/api/incident-attachments/${attachment.id}`}
              unoptimized
              width={240}
            />
          </a>
          <figcaption className="grid gap-2 px-3 py-3 text-xs font-semibold text-[var(--color-text-muted)]">
            <span className="inline-flex items-center gap-2">
              <FiImage aria-hidden="true" />
              {attachment.caption || attachment.original_name}
            </span>
            {canManage ? (
              <form action={deleteIncidentAttachment}>
                <input name="returnPath" type="hidden" value="/dashboard/incidents" />
                <input name="id" type="hidden" value={attachment.id} />
                <SubmitButton className={`${dangerButtonClass} w-full`} pendingLabel="Eliminando...">
                  Eliminar imagen
                </SubmitButton>
              </form>
            ) : null}
          </figcaption>
        </figure>
      ))}
    </section>
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

function CategoryField({ defaultValue = "other" }: Readonly<{ defaultValue?: string }>) {
  return (
    <Field label="Categoria">
      <select className={inputClass} defaultValue={defaultValue} name="category">
        {incidentCategories.map((category) => (
          <option key={category} value={category}>
            {categoryLabel(category)}
          </option>
        ))}
      </select>
    </Field>
  );
}

function PriorityField({ defaultValue = "medium" }: Readonly<{ defaultValue?: string }>) {
  return (
    <Field label="Prioridad">
      <select className={inputClass} defaultValue={defaultValue} name="priority">
        {incidentPriorities.map((priority) => (
          <option key={priority} value={priority}>
            {priorityLabel(priority)}
          </option>
        ))}
      </select>
    </Field>
  );
}

function StatusField({ defaultValue = "open" }: Readonly<{ defaultValue?: string }>) {
  return (
    <Field label="Estado">
      <select className={inputClass} defaultValue={defaultValue} name="status">
        {incidentStatuses.map((status) => (
          <option key={status} value={status}>
            {statusLabel(status)}
          </option>
        ))}
      </select>
    </Field>
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

function groupBy<T>(items: T[], key: keyof T) {
  const map = new Map<string | null, T[]>();

  for (const item of items) {
    const value = String(item[key] ?? "");
    const current = map.get(value) ?? [];
    current.push(item);
    map.set(value, current);
  }

  return map;
}

function brandLabel(company?: Company) {
  if (!company) return "Sin marca";
  if (company.slug === "etn") return "ETN";
  if (company.slug === "gho") return "GHO";
  if (company.slug === "costaline") return "Costaline";

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

function eventLabel(value: string) {
  const labels: Record<string, string> = {
    assignment_change: "Responsable",
    note: "Comentario",
    priority_change: "Prioridad",
    resolution: "Resolucion",
    status_change: "Estado",
  };

  return labels[value] ?? value;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
