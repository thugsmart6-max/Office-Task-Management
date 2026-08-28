"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { idOf } from "@/lib/serialize";
import { statusLabel, taskHref } from "@/lib/utils";
import { TaskStatus } from "@/types";

type Hit = {
  _id: string;
  title: string;
  status: TaskStatus;
};

export function CommandPalette() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const { data } = useSession();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function close() {
    setOpen(false);
    setQ("");
    setHits([]);
  }

  useEffect(() => {
    close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, search]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") close();
    }
    function onPointer(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) close();
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onPointer);
    };
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(async () => {
      const res = await fetch(`/api/tasks?q=${encodeURIComponent(q)}&limit=8`);
      if (!res.ok) return;
      const payload = await res.json();
      setHits(payload.items || []);
    }, 160);
    return () => window.clearTimeout(id);
  }, [q, open]);

  const shortcuts = useMemo(() => {
    const role = data?.user?.role;
    if (role === "admin") {
      return [
        { href: "/admin/dashboard", label: "Dashboard" },
        { href: "/admin/tasks", label: "All work" },
        { href: "/admin/users", label: "People" },
      ];
    }
    if (role === "manager") {
      return [
        { href: "/manager/dashboard", label: "Dashboard" },
        { href: "/manager/tasks/new", label: "New task" },
        { href: "/manager/reports", label: "Reports" },
      ];
    }
    return [{ href: "/user/dashboard", label: "My work" }];
  }, [data?.user?.role]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="ws-btn ws-btn-icon"
        aria-label={open ? "Close search" : "Search tasks"}
      >
        {open ? (
          <span className="text-lg leading-none" aria-hidden>
            ×
          </span>
        ) : (
          <SearchIcon />
        )}
      </button>

      {open ? (
        <div className="fixed inset-x-3 top-[6.75rem] z-[90] max-h-[min(70dvh,32rem)] overflow-y-auto border border-line bg-bg p-3 md:absolute md:inset-x-auto md:right-0 md:top-[calc(100%+0.6rem)] md:w-[min(22rem,calc(100vw-1.5rem))]">
          <label className="block">
            <span className="ws-label">Search</span>
            <div className="flex items-center gap-2">
              <SearchIcon />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Find a task"
                className="ws-input h-10 min-w-0 flex-1"
              />
            </div>
          </label>

          {hits.length ? (
            <div className="mt-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                Tasks
              </p>
              <ul className="max-h-64 overflow-auto">
                {hits.map((hit) => {
                  const id = idOf(hit._id) || idOf(hit);
                  return (
                    <li key={id} className="border-t border-line">
                      <Link
                        href={taskHref(data?.user?.role, id)}
                        onClick={close}
                        className="flex items-center justify-between gap-3 py-3 hover:text-accent"
                      >
                        <span className="min-w-0 truncate text-[14px] text-fg">{hit.title}</span>
                        <span className="shrink-0 rounded-sm border border-line px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted">
                          {statusLabel(hit.status)}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : q.trim() ? (
            <p className="mt-4 text-[13px] text-muted">No matching tasks.</p>
          ) : null}

          <div className="mt-4 border-t border-line pt-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
              Jump to
            </p>
            <div className="flex flex-col gap-2">
              {shortcuts.map((s) => (
                <Link key={s.href} href={s.href} onClick={close} className="ws-btn w-full">
                  {s.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      className="h-4 w-4 max-w-none shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M16 16.5 20.5 21" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}
