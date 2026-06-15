"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";

type DashboardDialogProps = {
  children: ReactNode;
  defaultOpen?: boolean;
  title: string;
  trigger: ReactNode;
};

export function DashboardDialog({
  children,
  defaultOpen = false,
  title,
  trigger,
}: Readonly<DashboardDialogProps>) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (defaultOpen) {
      dialogRef.current?.showModal();
    }
  }, [defaultOpen]);

  return (
    <>
      <button className="inline-flex" onClick={() => dialogRef.current?.showModal()} type="button">
        {trigger}
      </button>
      <dialog
        className="glass-panel-strong fixed inset-0 m-auto hidden h-fit max-h-[calc(100vh-2rem)] w-[min(92vw,46rem)] overflow-y-auto rounded-lg p-0 text-[var(--color-text-primary)] shadow-[0_24px_70px_rgba(0,0,0,0.36)] backdrop:bg-[#020617]/72 open:block"
        ref={dialogRef}
      >
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-panel-strong)] px-5 py-4">
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
        <div className="px-5 py-5">{children}</div>
      </dialog>
    </>
  );
}
