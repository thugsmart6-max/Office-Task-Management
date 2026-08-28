import Link from "next/link";
import { ReactNode } from "react";

export function EmptyState({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="ws-frame px-4 py-8 text-center sm:px-6 sm:py-12">
      <p className="font-display text-2xl uppercase sm:text-3xl">{title}</p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">{body}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="ws-btn mt-6">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function Banner({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "warn";
}) {
  return (
    <div
      className={
        tone === "warn"
          ? "ws-frame mb-5 border-[var(--status-waiting)] px-3 py-3 text-sm text-[var(--status-waiting)] sm:mb-8 sm:px-4"
          : "ws-frame mb-5 px-3 py-3 text-sm text-muted sm:mb-8 sm:px-4"
      }
    >
      {children}
    </div>
  );
}

export function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-10 first:mt-0 sm:mt-14">
      <div className="mb-4 flex flex-col items-start justify-between gap-1 sm:mb-5 sm:flex-row sm:items-end sm:gap-4">
        <h2 className="font-display text-[clamp(1.45rem,6.5vw,2.75rem)] uppercase leading-[0.9]">
          {title}
        </h2>
        {hint ? <p className="text-sm text-muted">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}
