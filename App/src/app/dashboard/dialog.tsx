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
        className="glass-panel-strong fixed inset-0 m-auto hidden max-h-[calc(100vh-2rem)] w-[min(92vw,46rem)] flex-col overflow-hidden rounded-lg p-0 text-[var(--color-text-primary)] shadow-[0_24px_70px_rgba(0,0,0,0.36)] backdrop:bg-[#020617]/72 open:flex"
        ref={dialogRef}
      >
        <header className="flex flex-none items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <div>
            <h2 className="font-display text-lg font-extrabold tracking-tight text-[var(--color-text-primary)]">{title}</h2>
            <span className="mt-2.5 block h-0.5 w-12 rounded-sm bg-[var(--color-primary)]" />
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
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </dialog>
    </>
  );
}
