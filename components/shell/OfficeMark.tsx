export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={
        compact
          ? "font-display text-[13px] uppercase leading-[0.9] tracking-tight text-fg"
          : "font-display text-[15px] uppercase leading-[0.9] tracking-tight text-fg"
      }
    >
      Office
      <br />
      Tasks
    </span>
  );
}