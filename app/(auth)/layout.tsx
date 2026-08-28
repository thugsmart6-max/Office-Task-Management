import { ReactNode, Suspense } from "react";
import { ThemeToggle } from "@/components/shell/ThemeToggle";
import { BrandMark } from "@/components/shell/OfficeMark";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative grid min-h-dvh bg-bg lg:grid-cols-2">
      <aside className="hidden min-h-dvh flex-col justify-between border-r border-line px-10 py-10 lg:flex xl:px-16">
        <BrandMark />
        <div>
          <p className="font-display text-5xl leading-[0.92] uppercase xl:text-6xl 2xl:text-7xl">
            We make
            <br />
            Work
            <br />
            That gets
            <br />
            <span className="text-accent">Done.</span>
          </p>
          <p className="mt-8 max-w-sm text-[15px] leading-relaxed text-muted">
            Assign it. Track it. Finish it. Managers see the team. People see only their work.
          </p>
        </div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Office Tasks</p>
      </aside>
      <div className="flex min-h-dvh flex-col px-3 py-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-8 sm:py-6 md:px-12 md:py-10">
        <div className="mb-8 flex items-center justify-between md:mb-14">
          <div className="lg:invisible">
            <BrandMark compact />
          </div>
          <ThemeToggle />
        </div>
        <Suspense>{children}</Suspense>
      </div>
    </div>
  );
}
