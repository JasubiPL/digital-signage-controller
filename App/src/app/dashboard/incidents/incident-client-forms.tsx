"use client";

import { useRouter } from "next/navigation";
import type { ComponentProps, Dispatch, ReactNode, SetStateAction } from "react";
import { useRef, useState, useTransition } from "react";
import { FiBold, FiEdit2, FiImage, FiItalic, FiLink, FiList, FiMessageCircle, FiTrash2, FiType, FiX } from "react-icons/fi";

import {
  updateLocationIncident,
  updateLocationIncidentStatus,
} from "@/app/dashboard/actions";

import {
  buttonClass,
  ghostButtonClass,
  Field,
  inputClass,
} from "../components";
import {
  ImageUploadField,
  type UploadQueueItem,
  validateUploadItems,
} from "./image-upload-field";

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

type EditableIncident = {
  assignee_name: string | null;
  category: string;
  description: string;
  id: string;
  priority: string;
  resolution_summary: string | null;
  status: string;
  title: string;
};

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
const incidentPriorities = ["low", "medium", "high", "critical"];
const incidentStatuses = ["open", "in_progress", "waiting", "resolved", "canceled"];
const toolbarButtonClass =
  "inline-grid h-9 w-9 place-items-center rounded-md border border-[var(--color-border)] bg-[rgba(2,6,23,0.52)] text-[var(--color-text-muted)] transition hover:border-[var(--color-primary-border)] hover:text-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-50";
const toolbarSelectClass =
  "h-9 rounded-md border border-[var(--color-border)] bg-[rgba(2,6,23,0.52)] px-2 text-xs font-extrabold text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50";

type UploadTarget = {
  incidentId: string;
  noteId?: string;
};

export function CreateIncidentForm({
  companies,
  locations,
}: Readonly<{
  companies: Company[];
  locations: Location[];
}>) {
  const router = useRouter();
  const [items, setItems] = useState<UploadQueueItem[]>([]);
  const [assigneeName, setAssigneeName] = useState("");
  const [category, setCategory] = useState("other");
  const [description, setDescription] = useState("");
  const [locationId, setLocationId] = useState(locations[0]?.id ?? "");
  const [priority, setPriority] = useState("medium");
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const validationError = validateUploadItems(items);
  const requiredFieldsReady = Boolean(
    locationId &&
      title.trim() &&
      description.trim() &&
      category &&
      priority &&
      assigneeName.trim(),
  );
  const canSubmit = requiredFieldsReady && !validationError && !submitting;

  return (
    <form
      className="grid gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setError(null);
        setMessage(null);

        if (validationError) {
          setError(validationError);
          return;
        }

        if (!requiredFieldsReady) {
          setError("Completa todos los campos obligatorios antes de crear el incidente.");
          return;
        }

        const form = event.currentTarget;
        setSubmitting(true);

        try {
          const response = await fetch("/api/incidents", {
            body: JSON.stringify({
              assigneeName: assigneeName.trim(),
              category,
              description: description.trim(),
              locationId,
              priority,
              title: title.trim(),
            }),
            headers: {
              "Content-Type": "application/json",
            },
            method: "POST",
          });
          const payload = await response.json();

          if (!response.ok) {
            throw new Error(payload.error ?? "No se pudo crear el incidente.");
          }

          await uploadQueue({
            incidentId: payload.incident.id,
            items,
            setItems,
          });
          setMessage(items.length ? "Incidente creado e imagenes cargadas." : "Incidente creado.");
          window.setTimeout(() => {
            form.closest("dialog")?.close();
            router.push("/dashboard/incidents?success=Incidente%20creado.");
            router.refresh();
          }, items.length ? 500 : 0);
        } catch (uploadError) {
          setError(uploadError instanceof Error ? uploadError.message : "No se pudo crear el incidente.");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <Field label="Taquilla">
        <select
          className={inputClass}
          disabled={submitting}
          name="locationId"
          onChange={(event) => setLocationId(event.currentTarget.value)}
          required
          value={locationId}
        >
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {brandLabel(companies.find((company) => company.id === location.company_id))} · {location.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Titulo">
        <input
          className={inputClass}
          disabled={submitting}
          name="title"
          onChange={(event) => setTitle(event.currentTarget.value)}
          required
          value={title}
        />
      </Field>
      <DescriptionEditor
        disabled={submitting}
        onChange={setDescription}
        value={description}
      />
      <section className="grid gap-4 md:grid-cols-3">
        <CategoryField disabled={submitting} onChange={setCategory} value={category} />
        <PriorityField disabled={submitting} onChange={setPriority} value={priority} />
        <Field label="Responsable">
          <input
            className={inputClass}
            disabled={submitting}
            name="assigneeName"
            onChange={(event) => setAssigneeName(event.currentTarget.value)}
            placeholder="Area o persona"
            required
            value={assigneeName}
          />
        </Field>
      </section>
      <ImageUploadField
        disabled={submitting}
        items={items}
        label="Imagenes iniciales"
        onItemsChange={setItems}
      />
      <FormMessage error={error} message={message} />
      <button
        className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-75`}
        disabled={!canSubmit}
        type="submit"
      >
        {submitting ? "Creando..." : "Crear incidente"}
      </button>
    </form>
  );
}

export function UploadIncidentAttachmentForm({
  incidentId,
}: Readonly<{ incidentId: string }>) {
  const router = useRouter();
  const [items, setItems] = useState<UploadQueueItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="grid gap-3 rounded-lg border border-[var(--color-border)] p-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setError(null);
        setMessage(null);

        const validationError = validateUploadItems(items);
        if (validationError) {
          setError(validationError);
          return;
        }

        if (!items.length) {
          setError("Selecciona al menos una imagen.");
          return;
        }

        setSubmitting(true);

        try {
          await uploadQueue({
            incidentId,
            items,
            setItems,
          });
          setMessage("Imagenes cargadas.");
          router.refresh();
        } catch (uploadError) {
          setError(uploadError instanceof Error ? uploadError.message : "No se pudo subir la imagen.");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <ImageUploadField
        disabled={submitting}
        items={items}
        label="Agregar imagen al incidente"
        onItemsChange={setItems}
      />
      <FormMessage error={error} message={message} />
      <button
        className={`${ghostButtonClass} disabled:cursor-not-allowed disabled:opacity-75`}
        disabled={submitting || !items.length || Boolean(validateUploadItems(items))}
        type="submit"
      >
        {submitting ? "Subiendo..." : "Subir imagen"}
      </button>
    </form>
  );
}

export function AddNoteForm({
  compact = false,
  incidentId,
  onSuccess,
  parentNoteId,
  placeholder = "Añadir una actualizacion o nota interna...",
  submitLabel = "Agregar comentario",
}: Readonly<{
  compact?: boolean;
  incidentId: string;
  onSuccess?: () => void;
  parentNoteId?: string;
  placeholder?: string;
  submitLabel?: string;
}>) {
  const router = useRouter();
  const [items, setItems] = useState<UploadQueueItem[]>([]);
  const [body, setBody] = useState("");
  const [editorKey, setEditorKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const imageDialogRef = useRef<HTMLDialogElement>(null);
  const validationError = validateUploadItems(items);
  const canSubmit = Boolean(stripHtml(body).trim()) && !validationError && !submitting;

  return (
    <form
      className={`grid gap-3 rounded-lg border border-[var(--color-border)] bg-[rgba(6,14,32,0.42)] ${compact ? "p-3" : "p-4"}`}
      onSubmit={async (event) => {
        event.preventDefault();
        setError(null);
        setMessage(null);

        if (validationError) {
          setError(validationError);
          return;
        }

        if (!stripHtml(body).trim()) {
          setError("Captura un comentario.");
          return;
        }

        setSubmitting(true);

        try {
          const response = await fetch("/api/incident-notes", {
            body: JSON.stringify({ body: body.trim(), incidentId, parentNoteId }),
            headers: {
              "Content-Type": "application/json",
            },
            method: "POST",
          });
          const payload = await response.json();

          if (!response.ok) {
            throw new Error(payload.error ?? "No se pudo agregar el comentario.");
          }

          await uploadQueue({
            incidentId,
            items,
            noteId: payload.note.id,
            setItems,
          });
          setMessage("Comentario agregado.");
          setBody("");
          setEditorKey((current) => current + 1);
          setItems([]);
          onSuccess?.();
          router.refresh();
        } catch (uploadError) {
          setError(uploadError instanceof Error ? uploadError.message : "No se pudo agregar el comentario.");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <RichTextEditor
        disabled={submitting}
        extraToolbar={
          <button
            aria-label="Agregar imagenes"
            className={toolbarButtonClass}
            disabled={submitting}
            onClick={() => imageDialogRef.current?.showModal()}
            title="Agregar imagenes"
            type="button"
          >
            <FiImage aria-hidden="true" />
          </button>
        }
        label="Comentario"
        key={editorKey}
        name="body"
        onChange={setBody}
        placeholder={placeholder}
        value={body}
      />
      {items.length ? (
        <p className="font-mono text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--color-primary)]">
          {items.length} imagen(es) preparadas para este comentario.
        </p>
      ) : null}
      <dialog
        className="glass-panel-strong fixed inset-0 m-auto hidden max-h-[calc(100vh-2rem)] w-[min(92vw,42rem)] flex-col overflow-hidden rounded-lg p-0 text-[var(--color-text-primary)] shadow-[0_24px_70px_rgba(0,0,0,0.36)] backdrop:bg-[#020617]/72 open:flex"
        ref={imageDialogRef}
      >
        <header className="flex flex-none items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <div>
            <h2 className="font-display text-lg font-extrabold tracking-tight text-[var(--color-text-primary)]">Imagenes del comentario</h2>
            <span className="mt-2.5 block h-0.5 w-12 rounded-sm bg-[var(--color-primary)]" />
          </div>
          <button
            aria-label="Cerrar"
            className="grid h-10 w-10 place-items-center rounded-md border border-[var(--color-border)] bg-[rgba(2,6,23,0.62)] text-[var(--color-text-muted)] transition hover:border-[var(--color-secondary)] hover:bg-[var(--color-secondary-muted)] hover:text-[var(--color-secondary-soft)]"
            onClick={() => imageDialogRef.current?.close()}
            type="button"
          >
            <FiX aria-hidden="true" className="h-5 w-5" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <ImageUploadField
            disabled={submitting}
            items={items}
            label="Imagenes de evidencia"
            onItemsChange={setItems}
          />
          <button
            className={`${ghostButtonClass} mt-4 w-full`}
            onClick={() => imageDialogRef.current?.close()}
            type="button"
          >
            Usar imagenes seleccionadas
          </button>
        </div>
      </dialog>
      <FormMessage error={error} message={message} />
      <button
        className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-75`}
        disabled={!canSubmit}
        type="submit"
      >
        {submitting ? "Comentando..." : submitLabel}
      </button>
    </form>
  );
}

export function IncidentNoteActions({
  authorName,
  canManage,
  incidentId,
  noteBody,
  noteId,
}: Readonly<{
  authorName: string;
  canManage: boolean;
  incidentId: string;
  noteBody: string;
  noteId: string;
}>) {
  const router = useRouter();
  const [activePanel, setActivePanel] = useState<"edit" | "reply" | null>(null);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editBody, setEditBody] = useState(noteBody);
  const [error, setError] = useState<string | null>(null);

  const canSaveEdit = Boolean(stripHtml(editBody).trim()) && !editing;

  async function saveEdit() {
    setError(null);

    if (!stripHtml(editBody).trim()) {
      setError("Captura un comentario.");
      return;
    }

    setEditing(true);

    try {
      const response = await fetch(`/api/incident-notes/${noteId}`, {
        body: JSON.stringify({ body: editBody.trim() }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error ?? "No se pudo editar el comentario.");
      }

      setActivePanel(null);
      router.refresh();
    } catch (editError) {
      setError(editError instanceof Error ? editError.message : "No se pudo editar el comentario.");
    } finally {
      setEditing(false);
    }
  }

  async function deleteNote() {
    if (!window.confirm("¿Eliminar este comentario?")) return;

    setError(null);
    setDeleting(true);

    try {
      const response = await fetch(`/api/incident-notes/${noteId}`, {
        method: "DELETE",
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error ?? "No se pudo eliminar el comentario.");
      }

      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "No se pudo eliminar el comentario.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mt-4 grid gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          className="inline-flex items-center gap-2 rounded-md px-0 py-1 text-sm font-extrabold text-[var(--color-text-soft)] transition hover:text-[var(--color-primary-soft)]"
          onClick={() => setActivePanel((current) => current === "reply" ? null : "reply")}
          type="button"
        >
          <FiMessageCircle aria-hidden="true" />
          Responder
        </button>
        {canManage ? (
          <>
            <button
              className="inline-flex items-center gap-2 rounded-md px-0 py-1 text-sm font-extrabold text-[var(--color-text-soft)] transition hover:text-[var(--color-primary-soft)]"
              onClick={() => {
                setEditBody(noteBody);
                setActivePanel((current) => current === "edit" ? null : "edit");
              }}
              type="button"
            >
              <FiEdit2 aria-hidden="true" />
              Editar
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-md px-0 py-1 text-sm font-extrabold text-[var(--color-text-soft)] transition hover:text-[var(--color-secondary-soft)] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={deleting}
              onClick={deleteNote}
              type="button"
            >
              <FiTrash2 aria-hidden="true" />
              {deleting ? "Eliminando..." : "Eliminar"}
            </button>
          </>
        ) : null}
      </div>

      {activePanel === "reply" ? (
        <AddNoteForm
          compact
          incidentId={incidentId}
          onSuccess={() => setActivePanel(null)}
          parentNoteId={noteId}
          placeholder={`Responder a ${authorName}...`}
          submitLabel="Responder"
        />
      ) : null}

      {activePanel === "edit" ? (
        <div className="grid gap-3 rounded-lg border border-[var(--color-border)] bg-[rgba(2,6,23,0.3)] p-3">
          <RichTextEditor
            disabled={editing}
            label="Editar comentario"
            name={`edit-${noteId}`}
            onChange={setEditBody}
            value={editBody}
          />
          <div className="flex flex-wrap gap-2">
            <button
              className={`${buttonClass} min-h-10 px-4 py-1.5 disabled:cursor-not-allowed disabled:opacity-75`}
              disabled={!canSaveEdit}
              onClick={saveEdit}
              type="button"
            >
              {editing ? "Guardando..." : "Guardar"}
            </button>
            <button
              className={`${ghostButtonClass} min-h-10 px-4 py-1.5`}
              onClick={() => setActivePanel(null)}
              type="button"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : null}

      <FormMessage error={error} message={null} />
    </div>
  );
}

export function IncidentStatusSelect({
  disabled,
  incidentId,
  returnPath,
  value,
}: Readonly<{
  disabled: boolean;
  incidentId: string;
  returnPath: string;
  value: string;
}>) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form action={updateLocationIncidentStatus} ref={formRef}>
      <input name="returnPath" type="hidden" value={returnPath} />
      <input name="id" type="hidden" value={incidentId} />
      <select
        aria-label="Estado del incidente"
        className="h-9 rounded-full border border-[var(--color-primary-border)] bg-[var(--color-primary-muted)] px-4 font-mono text-xs font-extrabold text-[var(--color-primary-soft)] outline-none transition focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
        defaultValue={value}
        disabled={disabled || isPending}
        name="status"
        onChange={() => {
          startTransition(() => {
            formRef.current?.requestSubmit();
          });
        }}
      >
        {incidentStatuses.map((status) => (
          <option key={status} value={status}>
            {statusLabel(status)}
          </option>
        ))}
      </select>
    </form>
  );
}

export function AdminIncidentForm({
  incident,
  returnPath,
}: Readonly<{
  incident: EditableIncident;
  returnPath: string;
}>) {
  return (
    <form action={updateLocationIncident} className="mt-4 grid gap-4">
      <input name="returnPath" type="hidden" value={returnPath} />
      <input name="id" type="hidden" value={incident.id} />
      <Field label="Titulo">
        <input className={inputClass} defaultValue={incident.title} name="title" required />
      </Field>
      <RichTextEditor
        disabled={false}
        label="Descripcion"
        name="description"
        onChange={() => undefined}
        value={incident.description}
      />
      <CategoryField defaultValue={incident.category} disabled={false} />
      <PriorityField defaultValue={incident.priority} disabled={false} />
      <input name="status" type="hidden" value={incident.status} />
      <Field label="Responsable">
        <input className={inputClass} defaultValue={incident.assignee_name ?? ""} name="assigneeName" />
      </Field>
      <Field label="Resumen de resolucion">
        <textarea className={inputClass} defaultValue={incident.resolution_summary ?? ""} name="resolutionSummary" rows={2} />
      </Field>
      <Field label="Nota opcional">
        <textarea className={inputClass} name="note" rows={2} />
      </Field>
      <button className={buttonClass} type="submit">
        Guardar incidente
      </button>
    </form>
  );
}

export function RichTextEditor({
  disabled,
  extraToolbar,
  label,
  name,
  onChange,
  placeholder,
  value,
}: Readonly<{
  disabled: boolean;
  extraToolbar?: ReactNode;
  label: string;
  name: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}>) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState(value);

  const bindEditor = (node: HTMLDivElement | null) => {
    editorRef.current = node;

    if (node && node.dataset.editorReady !== "true") {
      node.innerHTML = html;
      node.dataset.editorReady = "true";
    }
  };

  const updateHtml = (nextHtml: string) => {
    setHtml(nextHtml);
    onChange(nextHtml);
  };

  const runCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    updateHtml(editorRef.current?.innerHTML ?? "");
  };

  const addLink = () => {
    const rawUrl = window.prompt("URL del enlace");
    if (!rawUrl?.trim()) return;

    const url = normalizeUrl(rawUrl.trim());
    editorRef.current?.focus();

    if (window.getSelection()?.toString()) {
      document.execCommand("createLink", false, url);
    } else {
      const label = window.prompt("Texto del enlace", url)?.trim() || url;
      document.execCommand("insertHTML", false, `<a href="${escapeAttribute(url)}">${escapeText(label)}</a>`);
    }

    updateHtml(editorRef.current?.innerHTML ?? "");
  };

  return (
    <Field label={label}>
      <div className="overflow-hidden rounded-md border border-[var(--color-border)] bg-[rgba(2,6,23,0.34)]">
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-border)] px-3 py-2">
          <button
            aria-label="Negritas"
            className={toolbarButtonClass}
            disabled={disabled}
            onClick={() => runCommand("bold")}
            title="Negritas"
            type="button"
          >
            <FiBold aria-hidden="true" />
          </button>
          <button
            aria-label="Cursiva"
            className={toolbarButtonClass}
            disabled={disabled}
            onClick={() => runCommand("italic")}
            title="Cursiva"
            type="button"
          >
            <FiItalic aria-hidden="true" />
          </button>
          <button
            aria-label="Agregar enlace"
            className={toolbarButtonClass}
            disabled={disabled}
            onClick={addLink}
            title="Agregar enlace"
            type="button"
          >
            <FiLink aria-hidden="true" />
          </button>
          <button
            aria-label="Lista"
            className={toolbarButtonClass}
            disabled={disabled}
            onClick={() => runCommand("insertUnorderedList")}
            title="Lista"
            type="button"
          >
            <FiList aria-hidden="true" />
          </button>
          <span className="ml-1 hidden text-[var(--color-text-muted)] sm:inline-flex">
            <FiType aria-hidden="true" />
          </span>
          <select
            aria-label="Tipografia"
            className={toolbarSelectClass}
            defaultValue=""
            disabled={disabled}
            onChange={(event) => {
              if (!event.currentTarget.value) return;
              runCommand("fontName", event.currentTarget.value);
              event.currentTarget.value = "";
            }}
          >
            <option value="">Fuente</option>
            <option value="sans">Sans</option>
            <option value="serif">Serif</option>
            <option value="mono">Mono</option>
          </select>
          <select
            aria-label="Tamano de letra"
            className={toolbarSelectClass}
            defaultValue=""
            disabled={disabled}
            onChange={(event) => {
              if (!event.currentTarget.value) return;
              runCommand("fontSize", event.currentTarget.value);
              event.currentTarget.value = "";
            }}
          >
            <option value="">Tamano</option>
            <option value="2">Chico</option>
            <option value="3">Normal</option>
            <option value="5">Grande</option>
          </select>
          {extraToolbar}
        </div>
        <input name={name} type="hidden" value={html} />
        <div
          aria-label={label}
          className="min-h-32 w-full overflow-auto px-4 py-3 text-sm font-semibold leading-7 text-[var(--color-text-primary)] outline-none empty:before:text-[var(--color-text-muted)] empty:before:content-[attr(data-placeholder)] focus:ring-4 focus:ring-[rgba(34,211,238,0.10)]"
          contentEditable={!disabled}
          data-placeholder={placeholder ?? ""}
          onInput={(event) => updateHtml(event.currentTarget.innerHTML)}
          ref={bindEditor}
          role="textbox"
          suppressContentEditableWarning
        />
        <textarea
          className="sr-only"
          name={`${name}PlainTextCheck`}
          readOnly
          required
          value={stripHtml(html)}
        />
      </div>
    </Field>
  );
}

function normalizeUrl(value: string) {
  if (/^(https?:|mailto:|tel:)/i.test(value)) return value;

  return `https://${value}`;
}

function escapeAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function DescriptionEditor(props: Omit<ComponentProps<typeof RichTextEditor>, "label" | "name">) {
  return <RichTextEditor {...props} label="Descripcion" name="description" />;
}

async function uploadQueue({
  incidentId,
  items,
  noteId,
  setItems,
}: UploadTarget & {
  items: UploadQueueItem[];
  setItems: Dispatch<SetStateAction<UploadQueueItem[]>>;
}) {
  for (const item of items) {
    if (item.status === "uploaded") continue;

    setItems((current) =>
      current.map((candidate) =>
        candidate.id === item.id
          ? { ...candidate, abort: undefined, error: undefined, progress: 0, status: "uploading" }
          : candidate,
      ),
    );

    try {
      await uploadOneFile({
        file: item.file,
        incidentId,
        noteId,
        onAbortReady: (abort) => {
          setItems((current) =>
            current.map((candidate) =>
              candidate.id === item.id ? { ...candidate, abort } : candidate,
            ),
          );
        },
        onProgress: (progress) => {
          setItems((current) =>
            current.map((candidate) =>
              candidate.id === item.id
                ? { ...candidate, progress, status: "uploading" }
                : candidate,
            ),
          );
        },
      });

      setItems((current) =>
        current.map((candidate) =>
          candidate.id === item.id
            ? { ...candidate, abort: undefined, progress: 100, status: "uploaded" }
            : candidate,
        ),
      );
    } catch (error: unknown) {
      if (error instanceof UploadCanceledError) {
        setItems((current) =>
          current.filter((candidate) => candidate.id !== item.id),
        );
        continue;
      }

      const message = error instanceof Error ? error.message : "No se pudo subir el archivo.";
      setItems((current) =>
        current.map((candidate) =>
          candidate.id === item.id
            ? { ...candidate, abort: undefined, error: message, progress: 100, status: "error" }
            : candidate,
        ),
      );
      throw new Error(message);
    }
  }
}

function uploadOneFile({
  file,
  incidentId,
  noteId,
  onAbortReady,
  onProgress,
}: {
  file: File;
  incidentId: string;
  noteId?: string;
  onAbortReady: (abort: () => void) => void;
  onProgress: (progress: number) => void;
}) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    const formData = new FormData();

    formData.set("incidentId", incidentId);
    formData.set("file", file);
    if (noteId) formData.set("noteId", noteId);

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress(Math.min(99, (event.loaded / event.total) * 100));
    };
    request.onabort = () => reject(new UploadCanceledError());
    request.onerror = () => reject(new Error("La carga se interrumpio por un error de red."));
    request.onload = () => {
      let payload: { error?: string } = {};
      try {
        payload = JSON.parse(request.responseText);
      } catch {
        payload = {};
      }

      if (request.status >= 200 && request.status < 300) {
        onProgress(100);
        resolve();
        return;
      }

      reject(new Error(payload.error ?? "No se pudo subir el archivo."));
    };
    request.open("POST", "/api/incident-attachments");
    onAbortReady(() => request.abort());
    request.send(formData);
  });
}

class UploadCanceledError extends Error {}

function CategoryField({
  defaultValue,
  disabled,
  onChange,
  value,
}: Readonly<{
  defaultValue?: string;
  disabled: boolean;
  onChange?: (value: string) => void;
  value?: string;
}>) {
  const valueProps = value === undefined ? { defaultValue } : { value };

  return (
    <Field label="Categoria">
      <select
        className={inputClass}
        disabled={disabled}
        name="category"
        onChange={(event) => onChange?.(event.currentTarget.value)}
        required
        {...valueProps}
      >
        {incidentCategories.map((category) => (
          <option key={category} value={category}>
            {categoryLabel(category)}
          </option>
        ))}
      </select>
    </Field>
  );
}

function PriorityField({
  defaultValue,
  disabled,
  onChange,
  value,
}: Readonly<{
  defaultValue?: string;
  disabled: boolean;
  onChange?: (value: string) => void;
  value?: string;
}>) {
  const valueProps = value === undefined ? { defaultValue } : { value };

  return (
    <Field label="Prioridad">
      <select
        className={inputClass}
        disabled={disabled}
        name="priority"
        onChange={(event) => onChange?.(event.currentTarget.value)}
        required
        {...valueProps}
      >
        {incidentPriorities.map((priority) => (
          <option key={priority} value={priority}>
            {priorityLabel(priority)}
          </option>
        ))}
      </select>
    </Field>
  );
}

function FormMessage({
  error,
  message,
}: Readonly<{
  error: string | null;
  message: string | null;
}>) {
  if (!error && !message) return null;

  return (
    <p className={`rounded-md border px-4 py-3 text-sm font-extrabold ${
      error
        ? "border-[rgba(244,63,94,0.34)] bg-[var(--color-secondary-muted)] text-[var(--color-secondary-soft)]"
        : "border-[var(--color-primary-border)] bg-[var(--color-primary-muted)] text-[var(--color-primary-soft)]"
    }`}>
      {error ?? message}
    </p>
  );
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

  return labels[value] ?? value;
}

function statusLabel(value: string) {
  const labels: Record<string, string> = {
    canceled: "Cancelado",
    in_progress: "En proceso",
    open: "Abierto",
    resolved: "Resuelto",
    waiting: "En espera",
  };

  return labels[value] ?? value;
}

function stripHtml(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(div|p|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}
