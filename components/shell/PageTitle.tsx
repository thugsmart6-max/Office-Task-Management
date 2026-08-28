import { ReactNode } from "react";

export function PageTitle({
  kicker,
  title,
  lines,
  meta,
  actions,
}: {
  kicker?: string;
  title?: string;
  lines?: string[];
  meta?: string;
  actions?: ReactNode;
}) {
  const stacked = lines?.length ? lines : null;
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-10 sm:gap-6 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {kicker ? (
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-accent sm:mb-3 sm:text-[11px]">
            {kicker}
          </p>
        ) : null}
        {stacked ? (
          <h1 className="ws-hero">
            {stacked.map((line, i) => (
              <span key={i}>
                {i > 0 ? <br /> : null}
                {line}
              </span>
            ))}
          </h1>
        ) : (
          <h1 className="ws-page-title">{title}</h1>
        )}
        {meta ? (
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:mt-6 sm:text-base">
            {meta}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="w-full shrink-0 pb-1 md:w-auto [&>a]:flex [&>a]:w-full md:[&>a]:w-auto">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
