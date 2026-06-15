"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FiChevronDown, FiLogOut, FiUser } from "react-icons/fi";

type UserMenuProps = {
  avatarSrc: string;
  displayName: string;
  email: string;
};

export function UserMenu({
  avatarSrc,
  displayName,
  email,
}: Readonly<UserMenuProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex items-center gap-2.5 rounded-full border border-transparent px-1 py-1 transition hover:border-[var(--color-border)] hover:bg-[rgba(19,27,46,0.7)]"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className="flex flex-col items-end text-xs font-extrabold text-[var(--color-text-primary)]">
          <span>Hola {displayName}</span>
          <small className="font-mono text-[9px] tracking-[0.08em] text-[var(--color-primary)]">
            {email || "correo no disponible"}
          </small>
        </span>
        <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-[var(--color-primary-border)] bg-[var(--color-primary-muted)]">
          <Image
            alt={`Avatar de ${displayName}`}
            className="h-full w-full object-cover"
            height={40}
            src={avatarSrc}
            width={40}
          />
        </span>
        <FiChevronDown
          aria-hidden="true"
          className={`text-base text-[var(--color-text-muted)] transition ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen ? (
        <div
          className="glass-panel-strong absolute right-0 top-[calc(100%+0.5rem)] z-30 w-60 overflow-hidden rounded-lg border border-[var(--color-border)] p-1.5 shadow-[0_24px_70px_rgba(0,0,0,0.36)]"
          role="menu"
        >
          <button
            className="flex w-full cursor-not-allowed items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left text-sm font-bold text-[var(--color-text-muted)] opacity-60"
            disabled
            role="menuitem"
            type="button"
          >
            <span className="flex items-center gap-2.5">
              <FiUser aria-hidden="true" className="text-base" />
              Mi perfil
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
              Próximamente
            </span>
          </button>

          <form action="/logout" method="post">
            <button
              className="flex min-h-11 w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm font-extrabold text-[var(--color-text-secondary)] transition hover:bg-[var(--color-secondary-muted)] hover:text-[var(--color-secondary-soft)]"
              role="menuitem"
              type="submit"
            >
              <FiLogOut aria-hidden="true" className="text-base" />
              Cerrar sesión
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
