"use client";

import { type ReactNode, useRef } from "react";
import { FiX } from "react-icons/fi";

type DashboardDialogProps = {
  children: ReactNode;
  title: string;
  trigger: ReactNode;
};

export function DashboardDialog({
  children,
  title,
  trigger,
}: Readonly<DashboardDialogProps>) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button className="inline-flex" onClick={() => dialogRef.current?.showModal()} type="button">
        {trigger}
      </button>
      <dialog
        className="glass-panel-strong fixed inset-0 m-auto h-fit max-h-[calc(100vh-2rem)] w-[min(92vw,46rem)] rounded-lg p-0 text-[var(--color-text-primary)] shadow-[0_28px_100px_rgba(0,0,0,0.48)] backdrop:bg-[#020617]/65 backdrop:backdrop-blur-[3px]"
        ref={dialogRef}
      >
        <header className="flex items-center justify-between border-b border-[var(--color-border)] px-7 py-5">
          <div>
            <h2 className="font-display text-xl font-extrabold tracking-tight text-[var(--color-text-primary)]">{title}</h2>
            <span className="mt-3 block h-1 w-14 rounded-sm bg-[var(--color-primary)] shadow-[0_0_18px_rgba(34,211,238,0.45)]" />
          </div>
          <button
            aria-label="Cerrar"
            className="grid h-10 w-10 place-items-center rounded-md border border-[var(--color-border)] bg-[rgba(2,6,23,0.62)] text-[var(--color-text-muted)] shadow-[0_14px_28px_rgba(0,0,0,0.12)] transition hover:border-[var(--color-secondary)] hover:bg-[var(--color-secondary-muted)] hover:text-[var(--color-secondary-soft)]"
            onClick={() => dialogRef.current?.close()}
            type="button"
          >
            <FiX aria-hidden="true" className="h-5 w-5" />
          </button>
        </header>
        <div className="max-h-[72vh] overflow-y-auto px-7 py-6">{children}</div>
      </dialog>
    </>
  );
}
