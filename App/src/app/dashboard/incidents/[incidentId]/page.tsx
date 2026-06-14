import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  FiAlertTriangle,
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiCpu,
  FiEdit3,
  FiFileText,
  FiMapPin,
  FiUser,
} from "react-icons/fi";

import {
  EmptyState,
  Feedback,
} from "../../components";
import { getDashboardContext } from "../../data";
import { DashboardDialog } from "../../dialog";
import {
  AddNoteForm,
  AdminIncidentForm,
  IncidentNoteActions,
  IncidentStatusSelect,
  UploadIncidentAttachmentForm,
} from "../incident-client-forms";
import { AttachmentGallery } from "./incident-attachment-gallery";

type IncidentDetailPageProps = {
  params: Promise<{
    incidentId: string;
  }>;
  searchParams: Promise<{
    error?: string;
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
  device: string | null;
  id: string;
  name: string;
  projection: string | null;
  status: string;
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
  parent_note_id: string | null;
};

type Profile = {
  avatar_url: string | null;
  email: string | null;
  full_name: string | null;
  global_role: "manager" | "super_admin" | "user";
  id: string;
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

export default async function IncidentDetailPage({
  params,
  searchParams,
}: Readonly<IncidentDetailPageProps>) {
  const [{ incidentId }, { error, success }, { access, companies, supabase, user }] =
    await Promise.all([
      params,
      searchParams,
      getDashboardContext("/dashboard/incidents"),
    ]);

  if (!access.canAccessIncidents) {
    notFound();
  }

  const companyIds = companies.map((company) => company.id);
  if (!companyIds.length) {
    notFound();
  }

  const { data: incidentData, error: incidentError } = await supabase
    .from("location_incidents")
    .select("id, company_id, location_id, title, description, category, priority, status, assignee_name, reported_by, resolved_by, opened_at, resolved_at, resolution_summary, created_at, updated_at")
    .eq("id", incidentId)
    .in("company_id", companyIds)
    .maybeSingle();

  if (incidentError) throw incidentError;
  if (!incidentData) notFound();

  const incident = incidentData as Incident;
  const [{ data: locationData }, { data: notesData }, { data: attachmentsData }] =
    await Promise.all([
      supabase
        .from("locations")
        .select("id, company_id, name, device, projection, status")
        .eq("id", incident.location_id)
        .eq("company_id", incident.company_id)
        .maybeSingle(),
      supabase
        .from("location_incident_notes")
        .select("id, incident_id, parent_note_id, company_id, location_id, author_id, body, event_type, created_at")
        .eq("incident_id", incident.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("location_incident_attachments")
        .select("id, incident_id, note_id, company_id, location_id, original_name, mime_type, size_bytes, caption, status, created_at")
        .eq("incident_id", incident.id)
        .eq("status", "active")
        .order("created_at", { ascending: true }),
    ]);

  const location = (locationData ?? undefined) as Location | undefined;
  const notes = (notesData ?? []) as IncidentNote[];
  const attachments = (attachmentsData ?? []) as IncidentAttachment[];
  const authorIds = Array.from(
    new Set(
      [user.id, ...notes.map((note) => note.author_id)]
        .filter((authorId): authorId is string => Boolean(authorId)),
    ),
  );
  const { data: profilesData } = authorIds.length
    ? await supabase
        .from("profiles")
        .select("id, email, full_name, avatar_url, global_role")
        .in("id", authorIds)
    : { data: [] };
  const profileById = new Map(
    ((profilesData ?? []) as Profile[]).map((profile) => [profile.id, profile]),
  );
  const company = companies.find((candidate) => candidate.id === incident.company_id);
  const currentUserProfile = profileById.get(user.id);
  const incidentAttachments = attachments.filter((attachment) => !attachment.note_id);
  const attachmentsByNote = groupBy(
    attachments.filter((attachment) => attachment.note_id),
    "note_id",
  );
  const topLevelNotes = notes.filter((note) => !note.parent_note_id);
  const repliesByNote = groupBy(
    notes.filter((note) => note.parent_note_id),
    "parent_note_id",
  );
  const returnPath = `/dashboard/incidents/${incident.id}`;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <Feedback error={error} success={success} />

      <header className="grid gap-4">
        <Link
          className="inline-flex w-fit items-center gap-2 font-mono text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--color-primary)] transition hover:text-[var(--color-primary-soft)]"
          href="/dashboard/incidents"
        >
          <FiArrowLeft aria-hidden="true" />
          Incidentes
        </Link>
        <div className="grid gap-3">
          <p className="font-mono text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
            Incidente / {incident.title}
          </p>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)] md:text-4xl">
            {incident.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <IncidentBadge value={incident.priority} />
            <IncidentStatusSelect
              disabled={!access.isGlobalAdmin}
              incidentId={incident.id}
              returnPath={returnPath}
              value={incident.status}
            />
          </div>
        </div>
      </header>

      <section className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="grid gap-6">
          <article className="glass-panel relative overflow-hidden rounded-lg p-6">
            <div className="absolute right-6 top-6 text-7xl text-[rgba(34,211,238,0.055)]">
              <FiAlertTriangle aria-hidden="true" />
            </div>
            <div className="relative flex items-center justify-between gap-4">
              <SectionTitle icon={<FiFileText aria-hidden="true" />} title="Descripcion del problema" />
              {access.isGlobalAdmin ? (
                <DashboardDialog
                  title="Editar incidente"
                  trigger={
                    <span className="inline-grid h-10 w-10 place-items-center rounded-md border border-[var(--color-border)] bg-[rgba(2,6,23,0.62)] text-[var(--color-primary)] transition hover:-translate-y-0.5 hover:border-[var(--color-primary-border)] hover:text-[var(--color-primary-soft)]">
                      <span className="sr-only">Editar incidente</span>
                      <FiEdit3 aria-hidden="true" />
                    </span>
                  }
                >
                  <div className="grid gap-5">
                    <AdminIncidentForm incident={incident} returnPath={returnPath} />
                    <UploadIncidentAttachmentForm incidentId={incident.id} />
                    <AttachmentGallery
                      attachments={incidentAttachments}
                      returnPath={returnPath}
                      showDelete
                    />
                  </div>
                </DashboardDialog>
              ) : null}
            </div>
            <div className="mt-5 h-px bg-[var(--color-border)]" />
            <RichTextContent value={incident.description} />
            {incident.resolution_summary ? (
              <div className="mt-5 rounded-md border border-[var(--color-primary-border)] bg-[var(--color-primary-muted)] px-4 py-3 text-sm font-semibold leading-6 text-[var(--color-primary-soft)]">
                Resolucion: {incident.resolution_summary}
              </div>
            ) : null}
            <AttachmentGallery
              attachments={incidentAttachments}
              returnPath={returnPath}
            />
          </article>

          <section className="glass-panel rounded-lg p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SectionTitle icon={<FiClock aria-hidden="true" />} title="Historial de actividad" />
              <span className="font-mono text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--color-primary)]">
                {notes.length} evento(s)
              </span>
            </div>
            <div className="mt-6 grid gap-5">
              {!notes.length ? (
                <EmptyState>No hay comentarios registrados.</EmptyState>
              ) : (
                <div className="relative grid gap-5 pl-8 before:absolute before:left-3 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-[var(--color-border)]">
                  {topLevelNotes.map((note) => (
                    <ActivityItem
                      attachments={attachmentsByNote.get(note.id) ?? []}
                      currentUserId={user.id}
                      incidentId={incident.id}
                      key={note.id}
                      note={note}
                      profile={note.author_id ? profileById.get(note.author_id) : undefined}
                      replies={repliesByNote.get(note.id) ?? []}
                      repliesByNote={repliesByNote}
                      attachmentsByNote={attachmentsByNote}
                      profileById={profileById}
                      returnPath={returnPath}
                    />
                  ))}
                </div>
              )}
              <div className="relative pl-8">
                <Avatar profile={currentUserProfile} />
                <AddNoteForm incidentId={incident.id} />
              </div>
            </div>
          </section>
        </div>

        <aside className="grid content-start gap-4">
          <section className="glass-panel rounded-lg p-5">
            <h2 className="mono-label text-sm font-extrabold text-[var(--color-text-soft)]">
              Detalles del incidente
            </h2>
            <dl className="mt-5 grid gap-4 text-sm">
              <DetailItem icon={<FiUser aria-hidden="true" />} label="Asignado a" value={incident.assignee_name || "Sin asignar"} />
              <DetailItem icon={<FiMapPin aria-hidden="true" />} label="Marca" value={brandLabel(company)} />
              <DetailItem icon={<FiMapPin aria-hidden="true" />} label="Taquilla" value={location?.name ?? "Sin taquilla"} />
              <DetailItem icon={<FiCpu aria-hidden="true" />} label="Dispositivo" value={location?.device || location?.projection || "Sin dispositivo"} />
              <DetailItem icon={<FiCalendar aria-hidden="true" />} label="Inicio" value={formatDateTime(incident.opened_at)} />
            </dl>
          </section>
        </aside>
      </section>
    </div>
  );
}

function ActivityItem({
  attachments,
  attachmentsByNote,
  currentUserId,
  incidentId,
  level = 0,
  note,
  profile,
  profileById,
  replies,
  repliesByNote,
  returnPath,
}: Readonly<{
  attachments: IncidentAttachment[];
  attachmentsByNote: Map<string | null, IncidentAttachment[]>;
  currentUserId: string;
  incidentId: string;
  level?: number;
  note: IncidentNote;
  profile?: Profile;
  profileById: Map<string, Profile>;
  replies: IncidentNote[];
  repliesByNote: Map<string | null, IncidentNote[]>;
  returnPath: string;
}>) {
  const authorName = profile?.full_name || profile?.email || "Usuario";
  const canManage = note.event_type === "note" && note.author_id === currentUserId;

  return (
    <article className="relative rounded-lg border border-[var(--color-border)] bg-[rgba(2,6,23,0.42)] p-4">
      <Avatar profile={profile} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="font-mono text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--color-primary)]">
            {eventLabel(note.event_type)}
          </span>
          <p className="mt-1 text-sm font-extrabold text-[var(--color-text-primary)]">
            {authorName}
          </p>
        </div>
        <time className="font-mono text-xs font-bold text-[var(--color-text-muted)]">
          {formatDateTime(note.created_at)}
        </time>
      </div>
      <RichTextContent compact value={note.body} />
      <AttachmentGallery
        attachments={attachments}
        compact
        returnPath={returnPath}
      />
      {note.event_type === "note" ? (
        <IncidentNoteActions
          authorName={authorName}
          canManage={canManage}
          incidentId={incidentId}
          noteBody={note.body}
          noteId={note.id}
        />
      ) : null}
      {replies.length ? (
        <div className="mt-5 grid gap-4 border-l border-[var(--color-border)] pl-8">
          {replies.map((reply) => (
            <ActivityItem
              attachments={attachmentsByNote.get(reply.id) ?? []}
              attachmentsByNote={attachmentsByNote}
              currentUserId={currentUserId}
              incidentId={incidentId}
              key={reply.id}
              level={level + 1}
              note={reply}
              profile={reply.author_id ? profileById.get(reply.author_id) : undefined}
              profileById={profileById}
              replies={level < 2 ? repliesByNote.get(reply.id) ?? [] : []}
              repliesByNote={repliesByNote}
              returnPath={returnPath}
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}

function RichTextContent({
  compact = false,
  value,
}: Readonly<{
  compact?: boolean;
  value: string;
}>) {
  return (
    <div
      className={`${compact ? "mt-3 text-sm leading-6" : "mt-6 text-base leading-8"} rich-text-content font-semibold text-[var(--color-text-secondary)]`}
      dangerouslySetInnerHTML={{ __html: richTextHtml(value) }}
    />
  );
}

function Avatar({ profile }: Readonly<{ profile?: Profile }>) {
  const label = profile?.full_name || profile?.email || "Usuario";
  const avatarSrc = profile ? avatarSrcForProfile(profile) : "";
  const initials = label
    .split(/\s+|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "U";

  return (
    <span
      aria-label={label}
      className="absolute -left-[2.25rem] top-4 grid h-8 w-8 place-items-center overflow-hidden rounded-full border border-[var(--color-primary-border)] bg-[var(--color-primary-muted)] bg-cover bg-center font-mono text-xs font-extrabold text-[var(--color-primary)]"
      style={avatarSrc ? { backgroundImage: `url(${JSON.stringify(avatarSrc)})` } : undefined}
      title={label}
    >
      {avatarSrc ? <span className="sr-only">{initials}</span> : initials}
    </span>
  );
}

function avatarSrcForProfile(profile: Profile) {
  if (profile.avatar_url) return profile.avatar_url;

  if (profile.global_role === "super_admin") {
    return "/default-avatar/admin.png";
  }

  if (profile.global_role === "manager") {
    return "/default-avatar/manager.png";
  }

  return "/default-avatar/consultant.png";
}

function SectionTitle({
  icon,
  small = false,
  title,
}: Readonly<{
  icon: ReactNode;
  small?: boolean;
  title: string;
}>) {
  return (
    <h2 className={`flex items-center gap-3 font-display font-extrabold tracking-tight text-[var(--color-text-primary)] ${small ? "text-lg" : "text-2xl"}`}>
      <span className="text-[var(--color-primary)]">{icon}</span>
      {title}
    </h2>
  );
}

function DetailItem({
  icon,
  label,
  tone = "normal",
  value,
}: Readonly<{
  icon: ReactNode;
  label: string;
  tone?: "danger" | "normal";
  value: string;
}>) {
  return (
    <div className="grid grid-cols-[1.25rem_6rem_minmax(0,1fr)] items-start gap-2">
      <span className="mt-0.5 text-[var(--color-primary)]">{icon}</span>
      <dt className="font-semibold text-[var(--color-text-muted)]">{label}</dt>
      <dd className={`font-extrabold ${tone === "danger" ? "text-[var(--color-secondary-soft)]" : "text-[var(--color-text-primary)]"}`}>
        {value}
      </dd>
    </div>
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

function formatDuration(startValue: string, endValue: string | null) {
  const start = new Date(startValue).getTime();
  const end = endValue ? new Date(endValue).getTime() : Date.now();
  const totalMinutes = Math.max(0, Math.floor((end - start) / 60000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  const parts = [
    days ? `${days}d` : "",
    hours ? `${hours}h` : "",
    `${minutes}m`,
  ].filter(Boolean);

  return `${parts.join(" ")}${endValue ? "" : " y contando"}`;
}

function richTextHtml(value: string) {
  const source = value.trim();
  const html = /<\/?[a-z][\s\S]*>/i.test(source)
    ? source
    : markdownLikeToHtml(source);

  return sanitizeRichText(html);
}

function markdownLikeToHtml(value: string) {
  return escapeHtml(value)
    .replace(/\*\*([\s\S]*?)\*\*/g, "<strong>$1</strong>")
    .replace(/_([\s\S]*?)_/g, "<em>$1</em>")
    .replace(/\[tamano=(chico|normal|grande)\]([\s\S]*?)\[\/tamano\]/g, "$2")
    .replace(/\[fuente=(sans|serif|mono)\]([\s\S]*?)\[\/fuente\]/g, "$2")
    .replace(/\n/g, "<br />");
}

function sanitizeRichText(value: string) {
  const allowedTags = new Set([
    "a",
    "b",
    "br",
    "div",
    "em",
    "font",
    "h1",
    "h2",
    "h3",
    "h4",
    "i",
    "li",
    "ol",
    "p",
    "span",
    "strong",
    "u",
    "ul",
  ]);

  return value
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (tag, rawName: string, attrs: string) => {
      const name = rawName.toLowerCase();
      if (!allowedTags.has(name)) return "";
      if (tag.startsWith("</")) return `</${name}>`;
      if (name === "a") {
        const href = attrs.match(/\shref=["']?([^"'\s>]+)["']?/i)?.[1] ?? "";
        const safeHref = sanitizeHref(href);

        return safeHref
          ? `<a href="${safeHref}" target="_blank" rel="noreferrer">`
          : "<a>";
      }
      if (name === "br") return "<br />";
      if (name === "font") {
        const face = attrs.match(/\sface=["']?(sans|serif|mono)["']?/i)?.[1];
        const size = attrs.match(/\ssize=["']?([1-7])["']?/i)?.[1];
        const safeAttrs = [
          face ? `face="${face}"` : "",
          size ? `size="${size}"` : "",
        ].filter(Boolean).join(" ");

        return `<font${safeAttrs ? ` ${safeAttrs}` : ""}>`;
      }

      return `<${name}>`;
    })
    .replace(/\son\w+=["'][\s\S]*?["']/gi, "")
    .replace(/javascript:/gi, "");
}

function sanitizeHref(value: string) {
  const decoded = value.replace(/&amp;/g, "&").trim();
  if (!/^(https?:|mailto:|tel:)/i.test(decoded)) return "";

  return decoded
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
