"use client";

/* eslint-disable @next/next/no-img-element -- Signed storage redirects are more reliable with native image requests here. */

import { useRef, useState } from "react";
import { FiImage, FiX } from "react-icons/fi";

import { deleteIncidentAttachment } from "@/app/dashboard/actions";

import { dangerButtonClass } from "../../components";
import { SubmitButton } from "../../submit-button";

type IncidentAttachment = {
  caption: string | null;
  id: string;
  original_name: string;
};

type SelectedAttachment = IncidentAttachment & {
  imageUrl: string;
  label: string;
};

export function AttachmentGallery({
  attachments,
  compact = false,
  returnPath,
  showDelete = false,
}: Readonly<{
  attachments: IncidentAttachment[];
  compact?: boolean;
  returnPath: string;
  showDelete?: boolean;
}>) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedAttachment, setSelectedAttachment] = useState<SelectedAttachment | null>(null);

  if (!attachments.length) return null;

  function attachmentLabel(attachment: IncidentAttachment) {
    return attachment.caption || attachment.original_name;
  }

  function attachmentUrl(attachment: IncidentAttachment) {
    return `/api/incident-attachments/${attachment.id}`;
  }

  function openAttachment(attachment: IncidentAttachment) {
    setSelectedAttachment({
      ...attachment,
      imageUrl: attachmentUrl(attachment),
      label: attachmentLabel(attachment),
    });
    dialogRef.current?.showModal();
  }

  function closeAttachment() {
    dialogRef.current?.close();
    setSelectedAttachment(null);
  }

  return (
    <>
      <section className={`mt-5 grid gap-3 ${compact ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 md:grid-cols-4"}`}>
        {attachments.map((attachment) => {
          const label = attachmentLabel(attachment);
          const imageUrl = attachmentUrl(attachment);

          return (
            <figure
              className="group overflow-hidden rounded-md border border-[var(--color-border)] bg-[rgba(2,6,23,0.5)]"
              key={attachment.id}
            >
              <button
                aria-label={`Ver imagen ${label}`}
                className={`relative block w-full overflow-hidden bg-[rgba(2,6,23,0.72)] text-left ${compact ? "h-24" : "h-28"}`}
                onClick={() => openAttachment(attachment)}
                type="button"
              >
                <img
                  alt={label}
                  className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
                  loading="lazy"
                  src={imageUrl}
                />
              </button>
              <figcaption className="grid gap-2 px-3 py-2 text-xs font-semibold text-[var(--color-text-muted)]">
                <span className="inline-flex min-w-0 items-center gap-2">
                  <FiImage aria-hidden="true" className="flex-none" />
                  <span className="truncate">{label}</span>
                </span>
                {showDelete ? (
                  <form action={deleteIncidentAttachment}>
                    <input name="returnPath" type="hidden" value={returnPath} />
                    <input name="id" type="hidden" value={attachment.id} />
                    <SubmitButton className={`${dangerButtonClass} w-full py-1.5 text-xs`} pendingLabel="Eliminando...">
                      Eliminar
                    </SubmitButton>
                  </form>
                ) : null}
              </figcaption>
            </figure>
          );
        })}
      </section>

      <dialog
        className="glass-panel-strong fixed inset-0 m-auto hidden max-h-[calc(100vh-2rem)] w-[min(94vw,64rem)] flex-col overflow-hidden rounded-lg p-0 text-[var(--color-text-primary)] shadow-[0_24px_70px_rgba(0,0,0,0.36)] backdrop:bg-[#020617]/72 open:flex"
        onCancel={() => setSelectedAttachment(null)}
        ref={dialogRef}
      >
        <header className="flex flex-none items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <div className="min-w-0">
            <h2 className="truncate font-display text-lg font-extrabold tracking-tight text-[var(--color-text-primary)]">
              {selectedAttachment?.label ?? "Imagen del incidente"}
            </h2>
            <span className="mt-2.5 block h-0.5 w-12 rounded-sm bg-[var(--color-primary)]" />
          </div>
          <button
            aria-label="Cerrar"
            className="grid h-10 w-10 flex-none place-items-center rounded-md border border-[var(--color-border)] bg-[rgba(2,6,23,0.62)] text-[var(--color-text-muted)] transition hover:border-[var(--color-secondary)] hover:bg-[var(--color-secondary-muted)] hover:text-[var(--color-secondary-soft)]"
            onClick={closeAttachment}
            type="button"
          >
            <FiX aria-hidden="true" className="h-5 w-5" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-auto px-5 py-5">
          {selectedAttachment ? (
            <img
              alt={selectedAttachment.label}
              className="mx-auto max-h-[72vh] w-full rounded-md border border-[var(--color-border)] bg-[rgba(2,6,23,0.72)] object-contain"
              src={selectedAttachment.imageUrl}
            />
          ) : null}
        </div>
      </dialog>
    </>
  );
}
