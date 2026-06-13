"use client";

import { type ReactNode, useRef } from "react";

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
      <button onClick={() => dialogRef.current?.showModal()} type="button">
        {trigger}
      </button>
      <dialog
        className="fixed inset-0 m-auto h-fit max-h-[calc(100vh-2rem)] w-[min(92vw,46rem)] rounded-lg border border-zinc-200 bg-white p-0 shadow-[0_24px_90px_rgba(15,23,42,0.25)] backdrop:bg-zinc-950/45"
        ref={dialogRef}
      >
        <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-zinc-950">{title}</h2>
          <button
            aria-label="Cerrar"
            className="grid h-8 w-8 place-items-center rounded-full text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950"
            onClick={() => dialogRef.current?.close()}
            type="button"
          >
            x
          </button>
        </header>
        <div className="max-h-[72vh] overflow-y-auto px-6 py-5">{children}</div>
      </dialog>
    </>
  );
}
