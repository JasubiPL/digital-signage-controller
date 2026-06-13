"use client";

import { useRef, useState, useTransition } from "react";

import { buttonClass, inputClass } from "../components";

type AssignmentStatus = "active" | "draft" | "inactive";

const statusLabels: Record<AssignmentStatus, string> = {
  active: "Activa",
  draft: "Pendiente de Carga",
  inactive: "Inactiva",
};

const statusTones: Record<AssignmentStatus, string> = {
  active:
    "border-emerald-100 bg-emerald-50 text-emerald-600 theme-dark:border-emerald-900/50 theme-dark:bg-emerald-950/35 theme-dark:text-emerald-300",
  draft:
    "border-orange-100 bg-orange-50 text-orange-500 theme-dark:border-orange-900/50 theme-dark:bg-orange-950/35 theme-dark:text-orange-300",
  inactive:
    "border-red-100 bg-red-50 text-red-600 theme-dark:border-red-900/50 theme-dark:bg-red-950/35 theme-dark:text-red-300",
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
        className={`inline-flex min-w-28 items-center justify-center rounded-md border px-4 py-2 text-xs font-extrabold ${statusTones[status]}`}
      >
        {statusLabels[status]}
      </span>

      <div className="flex justify-center">
        <button
          className="inline-grid h-10 w-10 place-items-center rounded-md border border-orange-100 bg-orange-50 text-orange-500 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-100 theme-dark:border-orange-900/50 theme-dark:bg-orange-950/35 theme-dark:text-orange-300 theme-dark:hover:bg-orange-950/60"
          onClick={() => dialogRef.current?.showModal()}
          title="Editar estatus"
          type="button"
        >
          <span className="sr-only">Editar estatus</span>
          <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
            <path d="M4 16.8V20h3.2L18.7 8.5l-3.2-3.2L4 16.8Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="2.2" />
            <path d="m14.7 6.1 3.2 3.2" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
          </svg>
        </button>

        <dialog
          className="fixed inset-0 m-auto h-fit w-[min(92vw,28rem)] rounded-lg border border-slate-100 bg-white p-0 shadow-[0_28px_100px_rgba(15,23,42,0.26)] backdrop:bg-slate-950/45 theme-dark:border-slate-800 theme-dark:bg-slate-900"
          ref={dialogRef}
        >
          <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4 theme-dark:border-slate-800">
            <div>
              <h3 className="text-lg font-extrabold text-slate-800 theme-dark:text-slate-100">
                Editar estatus
              </h3>
              <p className="mt-1 text-sm font-semibold text-slate-500 theme-dark:text-slate-400">
                {campaignName}
              </p>
            </div>
            <button
              aria-label="Cerrar"
              className="grid h-9 w-9 place-items-center rounded-full border border-slate-100 bg-white text-slate-500 shadow-sm transition hover:bg-red-50 hover:text-red-600 theme-dark:border-slate-700 theme-dark:bg-slate-950 theme-dark:text-slate-300"
              onClick={() => dialogRef.current?.close()}
              type="button"
            >
              x
            </button>
          </header>

          <form action={submitStatus} className="grid gap-4 px-6 py-5">
            <label className="grid gap-2 text-sm">
              <span className="font-extrabold text-slate-600 theme-dark:text-slate-300">
                Estatus de la campania en esta taquilla
              </span>
              <select className={inputClass} defaultValue={status} name="status">
                <option value="active">Activa</option>
                <option value="draft">Pendiente de Carga</option>
                <option value="inactive">Inactiva</option>
              </select>
            </label>

            {error ? (
              <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 theme-dark:border-red-900/50 theme-dark:bg-red-950/35 theme-dark:text-red-300">
                {error}
              </p>
            ) : null}

            <div className="flex justify-end">
              <button className={buttonClass} disabled={isPending}>
                {isPending ? "Guardando..." : "Guardar estatus"}
              </button>
            </div>
          </form>
        </dialog>
      </div>
    </>
  );
}
