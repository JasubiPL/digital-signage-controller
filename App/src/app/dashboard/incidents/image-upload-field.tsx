"use client";

import { FiCheck, FiFile, FiUploadCloud, FiX } from "react-icons/fi";

export const maxFileBytes = 10 * 1024 * 1024;
export const maxTotalBytes = 30 * 1024 * 1024;

export type UploadStatus = "ready" | "uploading" | "uploaded" | "error";

export type UploadQueueItem = {
  abort?: () => void;
  error?: string;
  file: File;
  id: string;
  progress: number;
  status: UploadStatus;
};

type ImageUploadFieldProps = {
  disabled?: boolean;
  items: UploadQueueItem[];
  label: string;
  onItemsChange: (items: UploadQueueItem[]) => void;
};

export function createUploadItems(files: File[]) {
  return files.map((file) => ({
    file,
    id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
    progress: 0,
    status: "ready" as const,
  }));
}

export function validateUploadItems(items: UploadQueueItem[]) {
  const oversizedFile = items.find((item) => item.file.size > maxFileBytes);
  const totalBytes = items.reduce((sum, item) => sum + item.file.size, 0);

  if (oversizedFile) {
    return `"${oversizedFile.file.name}" supera el limite de ${formatBytes(maxFileBytes)} por imagen.`;
  }

  if (totalBytes > maxTotalBytes) {
    return `La carga total es de ${formatBytes(totalBytes)} y supera el limite de ${formatBytes(maxTotalBytes)}.`;
  }

  return "";
}

export function ImageUploadField({
  disabled = false,
  items,
  label,
  onItemsChange,
}: Readonly<ImageUploadFieldProps>) {
  const totalBytes = items.reduce((sum, item) => sum + item.file.size, 0);
  const validationError = validateUploadItems(items);
  const isUploading = items.some((item) => item.status === "uploading");
  const addFiles = (files: File[]) => {
    onItemsChange([...items, ...createUploadItems(files)]);
  };
  const removeFile = (id: string) => {
    items.find((item) => item.id === id)?.abort?.();
    onItemsChange(items.filter((item) => item.id !== id));
  };

  return (
    <section className="grid gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mono-label text-sm font-extrabold text-[var(--color-text-soft)]">
            {label}
          </p>
          <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">
            JPG, PNG, WebP o GIF. Maximo {formatBytes(maxFileBytes)} por imagen y {formatBytes(maxTotalBytes)} por carga.
          </p>
        </div>
        {items.length ? (
          <span className={`rounded-full border px-3 py-1.5 font-mono text-xs font-extrabold ${
            validationError
              ? "border-[rgba(244,63,94,0.34)] bg-[var(--color-secondary-muted)] text-[var(--color-secondary-soft)]"
              : "border-[var(--color-primary-border)] bg-[var(--color-primary-muted)] text-[var(--color-primary-soft)]"
          }`}>
            {formatBytes(totalBytes)}
          </span>
        ) : null}
      </div>

      {items.length ? (
        <div className="grid gap-2 rounded-lg border border-[var(--color-border)] bg-[rgba(2,6,23,0.34)] p-3">
          {items.map((item) => {
            const isTooLarge = item.file.size > maxFileBytes;
            const isError = item.status === "error" || isTooLarge;
            const statusLabel = item.status === "uploaded"
              ? "Cargado"
              : item.status === "uploading"
                ? `Subiendo ${Math.max(1, Math.round(item.progress))}%`
                : isError
                  ? "Error"
                  : "Listo";

            return (
              <div
                className="grid gap-3 rounded-md border border-[rgba(20,33,58,0.88)] bg-[rgba(3,10,24,0.66)] px-3 py-3 sm:grid-cols-[2rem_minmax(0,1fr)_auto_auto]"
                key={item.id}
              >
                <span className={`grid h-8 w-8 place-items-center rounded-md border ${
                  isError
                    ? "border-[rgba(244,63,94,0.34)] bg-[var(--color-secondary-muted)] text-[var(--color-secondary-soft)]"
                    : "border-[var(--color-primary-border)] bg-[var(--color-primary-muted)] text-[var(--color-primary)]"
                }`}>
                  <FiFile aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-[var(--color-text-primary)]">
                    {item.file.name}
                  </p>
                  {item.status === "uploading" || item.status === "uploaded" || isError ? (
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[rgba(148,163,184,0.16)]">
                      <span
                        className={`block h-full rounded-full transition-[width] duration-200 ${
                          isError
                            ? "bg-[var(--color-secondary)]"
                            : "bg-[var(--color-primary)]"
                        }`}
                        style={{ width: `${isError ? 100 : item.status === "uploaded" ? 100 : item.progress}%` }}
                      />
                    </div>
                  ) : null}
                  <p className={`mt-2 font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] ${
                    isError
                      ? "text-[var(--color-secondary-soft)]"
                      : item.status === "uploaded" || item.status === "uploading"
                        ? "text-[var(--color-primary)]"
                        : "text-[var(--color-text-muted)]"
                  }`}>
                    {statusLabel}
                  </p>
                  {item.error ? (
                    <p className="mt-1 text-xs font-semibold text-[var(--color-secondary-soft)]">
                      {item.error}
                    </p>
                  ) : null}
                </div>
                <span className={`inline-flex items-center gap-2 justify-self-start rounded-full border px-3 py-1.5 font-mono text-xs font-extrabold sm:justify-self-end ${
                  isError
                    ? "border-[rgba(244,63,94,0.34)] bg-[var(--color-secondary-muted)] text-[var(--color-secondary-soft)]"
                    : "border-[var(--color-primary-border)] bg-[var(--color-primary-muted)] text-[var(--color-primary-soft)]"
                }`}>
                  {isError ? <FiX aria-hidden="true" /> : item.status === "uploaded" ? <FiCheck aria-hidden="true" /> : null}
                  {formatBytes(item.file.size)}
                </span>
                <button
                  aria-label={`Quitar ${item.file.name}`}
                  className="inline-grid h-9 w-9 place-items-center justify-self-start rounded-md border border-[rgba(244,63,94,0.34)] bg-[var(--color-secondary-muted)] text-[var(--color-secondary-soft)] transition hover:-translate-y-0.5 hover:border-[var(--color-secondary)] hover:bg-[rgba(244,63,94,0.18)] disabled:cursor-not-allowed disabled:opacity-50 sm:justify-self-end"
                  disabled={disabled && item.status !== "uploading"}
                  onClick={() => removeFile(item.id)}
                  title={item.status === "uploading" ? "Cancelar carga" : item.status === "uploaded" ? "Quitar de la lista" : "Quitar archivo"}
                  type="button"
                >
                  <FiX aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
      ) : null}

      <label
        className={`group grid min-h-44 place-items-center rounded-lg border border-dashed px-5 py-6 text-center transition ${
          disabled
            ? "cursor-not-allowed border-[var(--color-border)] bg-[rgba(148,163,184,0.035)] opacity-70"
            : validationError
              ? "cursor-pointer border-[rgba(244,63,94,0.58)] bg-[rgba(69,10,10,0.18)]"
              : "cursor-pointer border-[rgba(34,211,238,0.48)] bg-[rgba(34,211,238,0.035)] hover:border-[var(--color-primary)] hover:bg-[rgba(34,211,238,0.075)]"
        }`}
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDrop={(event) => {
          event.preventDefault();
          if (!disabled) addFiles(Array.from(event.dataTransfer.files));
        }}
      >
        <input
          accept="image/gif,image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={disabled}
          multiple
          onChange={(event) => {
            addFiles(Array.from(event.currentTarget.files ?? []));
            event.currentTarget.value = "";
          }}
          type="file"
        />
        <span className="grid justify-items-center gap-3">
          <span className={`grid h-16 w-16 place-items-center rounded-full border text-4xl transition ${
            validationError
              ? "border-[rgba(244,63,94,0.34)] bg-[var(--color-secondary-muted)] text-[var(--color-secondary-soft)]"
              : "border-[var(--color-primary-border)] bg-[var(--color-primary-muted)] text-[var(--color-primary)] group-hover:scale-105"
          }`}>
            <FiUploadCloud aria-hidden="true" />
          </span>
          <span className="text-sm font-extrabold text-[var(--color-text-primary)]">
            Arrastra imagenes aqui o <span className="text-[var(--color-primary)]">selecciona archivos</span>
          </span>
          <span className="font-mono text-xs font-bold text-[var(--color-text-muted)]">
            {isUploading
              ? "Subiendo imagenes..."
              : items.length
                ? `${items.length} archivo(s) en la cola`
                : "Sin archivos seleccionados"}
          </span>
        </span>
      </label>

      {validationError ? (
        <p className="rounded-md border border-[rgba(244,63,94,0.34)] bg-[var(--color-secondary-muted)] px-4 py-3 text-sm font-extrabold text-[var(--color-secondary-soft)]">
          {validationError} El boton de envio queda inhabilitado hasta ajustar la carga.
        </p>
      ) : null}
    </section>
  );
}

export function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}
