"use client";

import { useRouter } from "next/navigation";
import type { ComponentProps, Dispatch, SetStateAction } from "react";
import { useEffect, useRef, useState, useTransition } from "react";
import { FiEdit2, FiImage, FiMessageCircle, FiTrash2, FiX } from "react-icons/fi";

import {
  updateIncidentLocations,
  updateLocationIncident,
  updateLocationIncidentStatus,
} from "@/app/dashboard/actions";
import { Spinner, SubmitButton } from "@/app/dashboard/submit-button";

import {
  buttonClass,
  ghostButtonClass,
  Field,
  inputClass,
} from "../components";
import {
  RichTextEditor,
  stripHtml,
  toolbarButtonClass,
} from "../rich-text-editor";
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

type UploadTarget = {
  incidentId: string;
  noteId?: string;
};

export function CreateIncidentForm({
  companies,
  defaultLocationId,
  locations,
}: Readonly<{
  companies: Company[];
  defaultLocationId?: string;
  locations: Location[];
}>) {
  const router = useRouter();
  const [items, setItems] = useState<UploadQueueItem[]>([]);
  const [assigneeName, setAssigneeName] = useState("");
  const [category, setCategory] = useState("other");
  const [description, setDescription] = useState("");
  const initialCompanyId =
    locations.find((location) => location.id === defaultLocationId)?.company_id ??
    locations[0]?.company_id ??
    "";
  const [companyId, setCompanyId] = useState(initialCompanyId);
  const [locationIds, setLocationIds] = useState<string[]>(
    defaultLocationId ? [defaultLocationId] : [],
  );
  const [priority, setPriority] = useState("medium");
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const validationError = validateUploadItems(items);
  const companyOptions = companies.filter((company) =>
    locations.some((location) => location.company_id === company.id),
  );
  const companyLocations = locations.filter(
    (location) => location.company_id === companyId,
  );
  const requiredFieldsReady = Boolean(
    locationIds.length &&
      title.trim() &&
      description.trim() &&
      category &&
      priority &&
      assigneeName.trim(),
  );
  const canSubmit = requiredFieldsReady && !validationError && !submitting;

  function handleCompanyChange(nextCompanyId: string) {
    setCompanyId(nextCompanyId);
    setLocationIds((current) =>
      current.filter((id) =>
        locations.some(
          (location) => location.id === id && location.company_id === nextCompanyId,
        ),
      ),
    );
  }

  function toggleLocation(id: string) {
    setLocationIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  }

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
              locationIds,
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
      <Field label="Marca">
        <select
          className={inputClass}
          disabled={submitting}
          onChange={(event) => handleCompanyChange(event.currentTarget.value)}
          value={companyId}
        >
          {companyOptions.map((company) => (
            <option key={company.id} value={company.id}>
              {brandLabel(company)}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Taquillas">
        {companyLocations.length ? (
          <div className="grid max-h-56 gap-1 overflow-y-auto rounded-md border border-[var(--color-border)] bg-[rgba(2,6,23,0.42)] p-2">
            {companyLocations.map((location) => {
              const checked = locationIds.includes(location.id);

              return (
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition ${
                    checked
                      ? "bg-[var(--color-primary-muted)] text-[var(--color-primary-soft)]"
                      : "text-[var(--color-text-secondary)] hover:bg-[rgba(148,163,184,0.08)]"
                  }`}
                  key={location.id}
                >
                  <input
                    checked={checked}
                    className="h-4 w-4 accent-[var(--color-primary)]"
                    disabled={submitting}
                    onChange={() => toggleLocation(location.id)}
                    type="checkbox"
                  />
                  {location.name}
                </label>
              );
            })}
          </div>
        ) : (
          <p className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-[var(--color-text-muted)]">
            Esta marca no tiene taquillas registradas.
          </p>
        )}
        {locationIds.length ? (
          <p className="mt-2 font-mono text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--color-primary)]">
            {locationIds.length} taquilla(s) seleccionada(s)
          </p>
        ) : null}
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

  useEffect(() => {
    if (!message) return;

    const timer = window.setTimeout(() => setMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [message]);

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
        className="glass-panel-strong fixed inset-0 m-auto hidden h-fit max-h-[calc(100vh-2rem)] w-[min(92vw,42rem)] overflow-y-auto rounded-lg p-0 text-[var(--color-text-primary)] shadow-[0_24px_70px_rgba(0,0,0,0.36)] backdrop:bg-[#020617]/72 open:block"
        ref={imageDialogRef}
      >
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-panel-strong)] px-5 py-4">
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
        <div className="px-5 py-5">
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
        {submitting ? <Spinner /> : null}
        <span>{submitting ? "Comentando..." : submitLabel}</span>
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
              {deleting ? <Spinner compact /> : <FiTrash2 aria-hidden="true" />}
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
              {editing ? <Spinner compact /> : null}
              <span>{editing ? "Guardando..." : "Guardar"}</span>
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
      <SubmitButton className={buttonClass} pendingLabel="Guardando incidente...">
        Guardar incidente
      </SubmitButton>
    </form>
  );
}

export function ManageIncidentLocationsForm({
  incidentId,
  locations,
  returnPath,
  selectedLocationIds,
}: Readonly<{
  incidentId: string;
  locations: Location[];
  returnPath: string;
  selectedLocationIds: string[];
}>) {
  const [selected, setSelected] = useState<string[]>(selectedLocationIds);

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  }

  return (
    <form action={updateIncidentLocations} className="grid gap-3">
      <input name="returnPath" type="hidden" value={returnPath} />
      <input name="id" type="hidden" value={incidentId} />
      <Field label="Taquillas afectadas">
        {locations.length ? (
          <div className="grid max-h-56 gap-1 overflow-y-auto rounded-md border border-[var(--color-border)] bg-[rgba(2,6,23,0.42)] p-2">
            {locations.map((location) => {
              const checked = selected.includes(location.id);

              return (
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition ${
                    checked
                      ? "bg-[var(--color-primary-muted)] text-[var(--color-primary-soft)]"
                      : "text-[var(--color-text-secondary)] hover:bg-[rgba(148,163,184,0.08)]"
                  }`}
                  key={location.id}
                >
                  <input
                    checked={checked}
                    className="h-4 w-4 accent-[var(--color-primary)]"
                    name="locationIds"
                    onChange={() => toggle(location.id)}
                    type="checkbox"
                    value={location.id}
                  />
                  {location.name}
                </label>
              );
            })}
          </div>
        ) : (
          <p className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-[var(--color-text-muted)]">
            Esta marca no tiene taquillas registradas.
          </p>
        )}
      </Field>
      <SubmitButton
        className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-75`}
        disabled={!selected.length}
        pendingLabel="Guardando taquillas..."
      >
        Guardar taquillas
      </SubmitButton>
    </form>
  );
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
