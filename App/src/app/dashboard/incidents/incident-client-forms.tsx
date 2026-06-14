"use client";

import { useRouter } from "next/navigation";
import type { Dispatch, SetStateAction } from "react";
import { useRef, useState } from "react";
import { FiBold, FiHash, FiItalic, FiList, FiType } from "react-icons/fi";

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

export function AddNoteForm({ incidentId }: Readonly<{ incidentId: string }>) {
  const router = useRouter();
  const [items, setItems] = useState<UploadQueueItem[]>([]);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const validationError = validateUploadItems(items);
  const canSubmit = Boolean(body.trim()) && !validationError && !submitting;

  return (
    <form
      className="grid gap-3 rounded-lg border border-[var(--color-border)] bg-[rgba(6,14,32,0.42)] p-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setError(null);
        setMessage(null);

        if (validationError) {
          setError(validationError);
          return;
        }

        const trimmedBody = body.trim();
        if (!trimmedBody) {
          setError("Captura un comentario.");
          return;
        }

        setSubmitting(true);

        try {
          const response = await fetch("/api/incident-notes", {
            body: JSON.stringify({ body: trimmedBody, incidentId }),
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
          router.refresh();
        } catch (uploadError) {
          setError(uploadError instanceof Error ? uploadError.message : "No se pudo agregar el comentario.");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <Field label="Comentario">
        <textarea
          className={inputClass}
          disabled={submitting}
          name="body"
          onChange={(event) => setBody(event.currentTarget.value)}
          required
          rows={3}
          value={body}
        />
      </Field>
      <ImageUploadField
        disabled={submitting}
        items={items}
        label="Imagenes de evidencia"
        onItemsChange={setItems}
      />
      <FormMessage error={error} message={message} />
      <button
        className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-75`}
        disabled={!canSubmit}
        type="submit"
      >
        {submitting ? "Comentando..." : "Agregar comentario"}
      </button>
    </form>
  );
}

function DescriptionEditor({
  disabled,
  onChange,
  value,
}: Readonly<{
  disabled: boolean;
  onChange: (value: string) => void;
  value: string;
}>) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toolbarButtonClass =
    "inline-grid h-9 w-9 place-items-center rounded-md border border-[var(--color-border)] bg-[rgba(2,6,23,0.52)] text-[var(--color-text-muted)] transition hover:border-[var(--color-primary-border)] hover:text-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-50";
  const toolbarSelectClass =
    "h-9 rounded-md border border-[var(--color-border)] bg-[rgba(2,6,23,0.52)] px-2 text-xs font-extrabold text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50";

  const replaceSelection = (before: string, after = "", fallback = "texto") => {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? value.length;
    const selected = value.slice(start, end) || fallback;
    const nextValue = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;

    onChange(nextValue);
    window.requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };

  const prefixSelectionLine = (prefix: string, fallback = "texto") => {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? value.length;
    const selected = value.slice(start, end) || fallback;
    const nextValue = `${value.slice(0, start)}${prefix}${selected}${value.slice(end)}`;

    onChange(nextValue);
    window.requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    });
  };

  return (
    <Field label="Descripcion">
      <div className="overflow-hidden rounded-md border border-[var(--color-border)] bg-[rgba(2,6,23,0.34)]">
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-border)] px-3 py-2">
          <button
            aria-label="Negritas"
            className={toolbarButtonClass}
            disabled={disabled}
            onClick={() => replaceSelection("**", "**")}
            title="Negritas"
            type="button"
          >
            <FiBold aria-hidden="true" />
          </button>
          <button
            aria-label="Cursiva"
            className={toolbarButtonClass}
            disabled={disabled}
            onClick={() => replaceSelection("_", "_")}
            title="Cursiva"
            type="button"
          >
            <FiItalic aria-hidden="true" />
          </button>
          <button
            aria-label="Titulo"
            className={toolbarButtonClass}
            disabled={disabled}
            onClick={() => prefixSelectionLine("### ", "Titulo")}
            title="Titulo"
            type="button"
          >
            <FiHash aria-hidden="true" />
          </button>
          <button
            aria-label="Lista"
            className={toolbarButtonClass}
            disabled={disabled}
            onClick={() => prefixSelectionLine("- ")}
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
              replaceSelection(`[fuente=${event.currentTarget.value}]`, "[/fuente]");
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
              replaceSelection(`[tamano=${event.currentTarget.value}]`, "[/tamano]");
              event.currentTarget.value = "";
            }}
          >
            <option value="">Tamano</option>
            <option value="chico">Chico</option>
            <option value="normal">Normal</option>
            <option value="grande">Grande</option>
          </select>
        </div>
        <textarea
          className="min-h-32 w-full resize-y border-0 bg-transparent px-4 py-3 text-sm font-semibold text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)] disabled:cursor-not-allowed disabled:opacity-70"
          disabled={disabled}
          name="description"
          onChange={(event) => onChange(event.currentTarget.value)}
          ref={textareaRef}
          required
          rows={5}
          value={value}
        />
      </div>
    </Field>
  );
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
  disabled,
  onChange,
  value,
}: Readonly<{
  disabled: boolean;
  onChange?: (value: string) => void;
  value?: string;
}>) {
  return (
    <Field label="Categoria">
      <select
        className={inputClass}
        disabled={disabled}
        name="category"
        onChange={(event) => onChange?.(event.currentTarget.value)}
        required
        value={value}
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
  disabled,
  onChange,
  value,
}: Readonly<{
  disabled: boolean;
  onChange?: (value: string) => void;
  value?: string;
}>) {
  return (
    <Field label="Prioridad">
      <select
        className={inputClass}
        disabled={disabled}
        name="priority"
        onChange={(event) => onChange?.(event.currentTarget.value)}
        required
        value={value}
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
