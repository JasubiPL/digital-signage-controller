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
        className="fixed inset-0 m-auto h-fit max-h-[calc(100vh-2rem)] w-[min(92vw,46rem)] rounded-lg border border-slate-100 bg-white p-0 shadow-[0_28px_100px_rgba(15,23,42,0.26)] backdrop:bg-slate-950/45 theme-dark:border-slate-800 theme-dark:bg-slate-900 theme-dark:shadow-[0_28px_100px_rgba(0,0,0,0.45)]"
        ref={dialogRef}
      >
        <header className="flex items-center justify-between border-b border-slate-100 px-7 py-5 theme-dark:border-slate-800">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-800 theme-dark:text-slate-100">{title}</h2>
            <span className="mt-3 block h-1 w-14 rounded-full bg-red-600" />
          </div>
          <button
            aria-label="Cerrar"
            className="grid h-9 w-9 place-items-center rounded-full border border-slate-100 bg-white text-slate-500 shadow-sm transition hover:bg-red-50 hover:text-red-600 theme-dark:border-slate-700 theme-dark:bg-slate-950 theme-dark:text-slate-300 theme-dark:hover:bg-red-950/30 theme-dark:hover:text-red-300"
            onClick={() => dialogRef.current?.close()}
            type="button"
          >
            x
          </button>
        </header>
        <div className="max-h-[72vh] overflow-y-auto px-7 py-6">{children}</div>
      </dialog>
    </>
  );
}
