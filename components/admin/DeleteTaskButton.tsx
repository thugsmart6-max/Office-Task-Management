"use client";

import { useRouter } from "next/navigation";

export function DeleteTaskButton({
  id,
  redirectTo = "/admin/tasks",
}: {
  id: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  return (
    <button
      className="mt-8 text-xs uppercase tracking-[0.2em] text-[var(--status-waiting)]"
      onClick={async () => {
        if (!confirm("Delete this task?")) return;
        const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
        if (!res.ok) return;
        router.push(redirectTo);
        router.refresh();
      }}
    >
      Delete task
    </button>
  );
}
