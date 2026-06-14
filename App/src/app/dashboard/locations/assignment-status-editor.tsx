"use client";

import { useRef, useState, useTransition } from "react";
import { FiEdit3, FiX } from "react-icons/fi";

import { buttonClass, Field, inputClass } from "../components";

type AssignmentStatus = "active" | "draft" | "inactive";

const statusLabels: Record<AssignmentStatus, string> = {
  active: "Activa",
  draft: "Pendiente de Carga",
  inactive: "Inactiva",
};

const statusTones: Record<AssignmentStatus, string> = {
  active:
    "border-[var(--color-primary-border)] bg-[var(--color-primary-muted)] text-[var(--color-primary-soft)]",
  draft:
    "border-[rgba(255,177,59,0.34)] bg-[var(--color-tertiary-muted)] text-[var(--color-tertiary-soft)]",
  inactive:
    "border-[rgba(244,63,94,0.34)] bg-[var(--color-secondary-muted)] text-[var(--color-secondary-soft)]",
};

function normalizeStatus(value: string): AssignmentStatus {
  if (value === "draft" || value === "inactive") return value;

  return "active";
}

export function AssignmentStatusEditor({
  assignmentId,
  campaignName,
  initialStatus,
}: Readonly<{
  assignmentId: string;
  campaignName: string;
  initialStatus: string;
}>) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<AssignmentStatus>(() =>
    normalizeStatus(initialStatus),
  );

  const submitStatus = (formData: FormData) => {
    const nextStatus = normalizeStatus(String(formData.get("status") ?? ""));
    setError(null);

    startTransition(async () => {
      const response = await fetch(`/api/campaign-locations/${assignmentId}`, {
        body: JSON.stringify({ status: nextStatus }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setError(
          payload?.error ??
            payload?.message ??
            "No se pudo actualizar el estatus.",
        );
        return;
      }

      setStatus(nextStatus);
      dialogRef.current?.close();
    });
  };

  return (
    <>
      <span
        className={`inline-flex min-w-24 items-center justify-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-xs font-extrabold ${statusTones[status]}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {statusLabels[status]}
      </span>

      <div className="flex justify-center">
        <button
          className="inline-grid h-9 w-9 place-items-center rounded-md border border-[rgba(20,33,58,0.88)] bg-[rgba(3,10,24,0.86)] text-[var(--color-tertiary)] transition hover:-translate-y-0.5 hover:border-[rgba(255,177,59,0.42)] hover:bg-[rgba(7,18,37,0.96)] hover:text-[var(--color-tertiary-soft)] hover:shadow-[0_12px_24px_rgba(255,177,59,0.1)]"
          onClick={() => dialogRef.current?.showModal()}
          title="Editar estatus"
          type="button"
        >
          <span className="sr-only">Editar estatus</span>
          <FiEdit3 aria-hidden="true" className="h-4 w-4" />
        </button>

        <dialog
          className="glass-panel-strong fixed inset-0 m-auto h-fit w-[min(92vw,28rem)] rounded-lg p-0 text-[var(--color-text-primary)] shadow-[0_24px_70px_rgba(0,0,0,0.36)] backdrop:bg-[#020617]/72"
          ref={dialogRef}
        >
          <header className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
            <div>
              <h3 className="font-display text-lg font-extrabold text-[var(--color-text-primary)]">
                Editar estatus
              </h3>
              <p className="mt-1 text-sm font-semibold text-[var(--color-text-muted)]">
                {campaignName}
              </p>
            </div>
            <button
              aria-label="Cerrar"
              className="grid h-10 w-10 place-items-center rounded-md border border-[var(--color-border)] bg-[rgba(2,6,23,0.62)] text-[var(--color-text-muted)] transition hover:border-[var(--color-secondary)] hover:bg-[var(--color-secondary-muted)] hover:text-[var(--color-secondary-soft)] hover:shadow-[0_12px_24px_rgba(244,63,94,0.1)]"
              onClick={() => dialogRef.current?.close()}
              type="button"
            >
              <FiX aria-hidden="true" className="h-5 w-5" />
            </button>
          </header>

          <form action={submitStatus} className="grid gap-4 px-6 py-5">
            <Field label="Estatus de la campaña en esta taquilla">
              <select className={inputClass} defaultValue={status} name="status">
                <option value="active">Activa</option>
                <option value="draft">Pendiente de Carga</option>
                <option value="inactive">Inactiva</option>
              </select>
            </Field>

            {error ? (
              <p className="rounded-md border border-[rgba(244,63,94,0.34)] bg-[var(--color-secondary-muted)] px-3 py-2 text-sm font-semibold text-[var(--color-secondary-soft)]">
                {error}
              </p>
            ) : null}

            <div className="flex justify-end">
              <button className={buttonClass} disabled={isPending}>
                {isPending ? (
                  <span
                    aria-hidden="true"
                    className="mr-2 inline-block h-4 w-4 rounded-full border-2 border-current border-r-transparent motion-safe:animate-spin"
                  />
                ) : null}
                <span>{isPending ? "Guardando..." : "Guardar estatus"}</span>
              </button>
            </div>
          </form>
        </dialog>
      </div>
    </>
  );
}
