import { initials } from "@/lib/utils";

export function Avatar({
  name,
  image,
  size = "sm",
}: {
  name?: string | null;
  image?: string | null;
  size?: "sm" | "md";
}) {
  const box = size === "md" ? "h-9 w-9 text-[10px]" : "h-6 w-6 text-[9px]";
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt=""
        className={`inline-block shrink-0 rounded-full border border-line object-cover ${box}`}
      />
    );
  }
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-line font-mono uppercase tracking-wider text-muted ${box}`}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
