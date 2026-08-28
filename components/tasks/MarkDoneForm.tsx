"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

export function MarkDoneForm({ taskId }: { taskId: string }) {
  const router = useRouter();
  const toast = useToast();
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "done", completionNote: note }),
    });
    const data = await res.json().catch(() => ({}));
    setPending(false);
    if (!res.ok) {
      setError(data.error || "Could not mark this done");
      return;
    }
    router.refresh();
    toast("Marked done. Your manager was notified.");
  }

  return (
    <form onSubmit={onSubmit} className="mt-12 max-w-xl">
      <label className="block">
        <span className="ws-label">Completion note</span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          placeholder="Optional: what shipped, what’s left, blockers…"
          className="ws-input min-h-[7rem]"
        />
      </label>
      {error ? <p className="mt-3 text-sm text-accent">{error}</p> : null}
      <button disabled={pending} className="ws-btn ws-btn-fill mt-5 min-h-12 px-8 disabled:opacity-50">
        {pending ? "Saving" : "Mark as done"}
      </button>
    </form>
  );
}

export function InProgressButton({ taskId }: { taskId: string }) {
  const router = useRouter();
  const toast = useToast();
  return (
    <button
      className="ws-btn min-h-12 px-8"
      onClick={async () => {
        const res = await fetch(`/api/tasks/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "in_progress" }),
        });
        if (!res.ok) return;
        toast("In progress");
        router.refresh();
      }}
    >
      Start progress
    </button>
  );
}
