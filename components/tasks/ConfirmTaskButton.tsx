"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ConfirmTaskButton({ taskId }: { taskId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function confirm() {
    setPending(true);
    setError("");
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "confirmed" }),
    });
    const data = await res.json().catch(() => ({}));
    setPending(false);
    if (!res.ok) {
      setError(data.error || "Could not confirm this task");
      return;
    }
    router.refresh();
  }

  return (
    <div className="mb-8">
      <button
        type="button"
        disabled={pending}
        onClick={confirm}
        className="ws-btn ws-btn-fill disabled:opacity-50"
      >
        {pending ? "Confirming" : "Confirm — show this to the user"}
      </button>
      {error ? (
        <p className="mt-2 text-sm text-[var(--status-waiting)]">{error}</p>
      ) : (
        <p className="mt-2 max-w-md text-sm text-muted">
          Pending work stays hidden from the assignee until you confirm it.
        </p>
      )}
    </div>
  );
}
