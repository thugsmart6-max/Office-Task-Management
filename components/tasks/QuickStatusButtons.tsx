"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Role, TaskStatus } from "@/types";

export function QuickStatusButtons({
  taskId,
  status,
  role,
}: {
  taskId: string;
  status: TaskStatus;
  role: Role;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  if (status === "done" || status === "cancelled") return null;

  const actions: { label: string; next: TaskStatus; fill: boolean }[] = [];
  if ((role === "admin" || role === "manager") && status === "pending") {
    actions.push({ label: "Confirm", next: "confirmed", fill: true });
  }
  if (role === "user" && status === "confirmed") {
    actions.push({ label: "Start", next: "in_progress", fill: false });
  }
  if (role === "user" && (status === "confirmed" || status === "in_progress")) {
    actions.push({ label: "Done", next: "done", fill: true });
  }

  if (!actions.length) return null;

  async function setStatus(next: TaskStatus) {
    setPending(true);
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setPending(false);
    if (res.ok) router.refresh();
  }

  return (
    <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto">
      {actions.map((action) => (
        <button
          key={action.next}
          type="button"
          disabled={pending}
          onClick={() => setStatus(action.next)}
          className={
            action.fill
              ? "ws-btn ws-btn-fill min-h-9 flex-1 px-4 disabled:opacity-50 sm:flex-none"
              : "ws-btn min-h-9 flex-1 px-4 disabled:opacity-50 sm:flex-none"
          }
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
