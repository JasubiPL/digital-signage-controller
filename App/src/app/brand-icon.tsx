import Image from "next/image";

type BrandIconProps = {
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  size?: number;
};

export function BrandIcon({
  className = "",
  imageClassName = "",
  priority = false,
  size = 48,
}: Readonly<BrandIconProps>) {
  return (
    <span
      aria-hidden="true"
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-lg border border-[var(--color-primary-border)] bg-[var(--color-primary-muted)] ${className}`}
    >
      <Image
        alt=""
        className={`h-full w-full object-cover ${imageClassName}`}
        height={size}
        priority={priority}
        src="/favicon.png"
        width={size}
      />
    </span>
  );
}
