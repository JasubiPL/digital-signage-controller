import Image from "next/image";

type SystemFooterProps = {
  className?: string;
};

export function SystemFooter({ className = "" }: Readonly<SystemFooterProps>) {
  return (
    <footer
      className={`flex flex-col items-center justify-center gap-2 text-center text-[11px] font-semibold text-[var(--color-text-muted)] sm:flex-row sm:gap-3 ${className}`}
    >
      <Image
        alt="JasubiP"
        className="h-auto w-24 opacity-80"
        height={40}
        src="/brand-logo.png"
        width={120}
      />
      <span className="leading-5">
        © 2014–2026 JasubiP Todos los derechos reservados.
      </span>
    </footer>
  );
}
