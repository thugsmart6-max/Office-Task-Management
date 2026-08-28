"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/shell/ThemeToggle";
import { Role } from "@/types";

export function AccountMenu({
  name,
  role,
  links,
}: {
  name?: string | null;
  role: Role;
  links: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointer(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="ws-btn h-11 w-11 min-w-11 p-0 tracking-normal"
        aria-label="Account menu"
        aria-expanded={open}
      >
        <span className="text-[11px] font-bold tracking-wide" aria-hidden>
          {initials(name)}
        </span>
      </button>

      {open ? (
        <div className="fixed inset-x-3 top-[6.75rem] z-[90] w-auto border border-line bg-bg p-3 md:absolute md:inset-x-auto md:right-0 md:top-[calc(100%+0.6rem)] md:w-64">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Account</p>
          <p className="mt-2 truncate text-[15px] font-semibold text-fg">{name}</p>
          <p className="mt-0.5 text-[12px] capitalize text-muted">{role}</p>

          <div className="mt-3 border-t border-line pt-3 md:hidden">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="ws-btn mb-2 w-full"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
            <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-muted">
              Theme
            </span>
            <ThemeToggle />
          </div>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="ws-btn ws-btn-fill mt-3 w-full"
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}

function initials(name?: string | null) {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (!parts.length) return "ME";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
