"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CommandPalette } from "@/components/shell/CommandPalette";
import { AccountMenu } from "@/components/shell/AccountMenu";
import { cn } from "@/lib/utils";
import { Role } from "@/types";

const nav: Record<Role, { href: string; label: string }[]> = {
  admin: [
    { href: "/admin/dashboard", label: "Work" },
    { href: "/admin/tasks", label: "Tasks" },
    { href: "/admin/users", label: "People" },
  ],
  manager: [
    { href: "/manager/dashboard", label: "Work" },
    { href: "/manager/tasks", label: "Tasks" },
    { href: "/manager/reports", label: "Reports" },
  ],
  user: [{ href: "/user/dashboard", label: "Work" }],
};

export function Header({
  role,
  name,
  overdue,
}: {
  role: Role;
  name?: string | null;
  overdue?: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const links = nav[role];

  useEffect(() => {
    const acc = document.querySelector('[aria-label="Account menu"]') as HTMLElement | null;
    const data = {
      innerWidth: window.innerWidth,
      overflowX: document.documentElement.scrollWidth - window.innerWidth,
      sm: window.matchMedia("(min-width: 640px)").matches,
      md: window.matchMedia("(min-width: 768px)").matches,
      lg: window.matchMedia("(min-width: 1024px)").matches,
      accW: acc ? Math.round(acc.getBoundingClientRect().width) : 0,
      accText: acc?.innerText?.replace(/\s+/g, " ").trim() ?? "",
      accClip: acc ? acc.scrollWidth - acc.clientWidth : 0,
      searchSvg: !!document.querySelector('[aria-label="Search tasks"] svg'),
      chips: getComputedStyle(document.querySelector("header > nav") as HTMLElement).display !== "none",
    };
    // #region agent log
    fetch("http://127.0.0.1:7777/ingest/a454df7c-dd9f-43eb-b297-1dd64d66020e", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "6394e8" },
      body: JSON.stringify({
        sessionId: "6394e8",
        runId: "post-fix-2",
        hypothesisId: "C",
        location: "Header.tsx:mount",
        message: "header layout probe",
        data,
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  }, [pathname]);

  return (
    <header className="sticky top-0 z-[80] border-b border-line bg-bg/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="flex min-w-0 items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-6 sm:py-3.5 md:px-10 lg:px-14 xl:px-16 2xl:px-24">
        <Link
          href="/"
          className="shrink-0 font-display text-[13px] uppercase leading-[0.9] tracking-tight text-fg sm:text-[15px]"
        >
          Office
          <br />
          Tasks
        </Link>

        <nav className="flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-3 md:gap-5">
          {links.map((link) => {
            const active = navActive(link.href, pathname, status);
            return (
              <Link
                key={`desk-${link.href}`}
                href={link.href}
                className={cn(
                  "hidden text-[13px] lg:inline",
                  active ? "text-fg" : "text-muted hover:text-fg",
                )}
              >
                {link.label}
              </Link>
            );
          })}
          {overdue ? (
            <span className="hidden text-[13px] text-accent xl:inline">{overdue} overdue</span>
          ) : null}
          <CommandPalette />
          <AccountMenu name={name} role={role} links={links} />
        </nav>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-2.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:px-6 lg:hidden [&::-webkit-scrollbar]:hidden">
        {links.map((link) => {
          const active = navActive(link.href, pathname, status);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "shrink-0 rounded-sm px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.14em]",
                active ? "bg-[var(--row-hover)] text-fg" : "text-muted",
              )}
            >
              {link.label}
            </Link>
          );
        })}
        {overdue ? (
          <span className="shrink-0 self-center px-2 text-[11px] font-semibold uppercase tracking-widest text-accent">
            {overdue} overdue
          </span>
        ) : null}
      </nav>
    </header>
  );
}

function navActive(href: string, pathname: string, status: string | null) {
  const [path, query] = href.split("?");
  if (query?.includes("status=done")) {
    return pathname.startsWith(path) && status === "done";
  }
  if (path.endsWith("/tasks")) {
    return pathname.startsWith(path) && status !== "done";
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}
