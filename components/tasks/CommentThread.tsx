"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDateTime } from "@/lib/utils";

type CommentRow = {
  _id: string;
  body: string;
  createdAt: string | Date;
  authorId?: { name?: string; role?: string } | string;
};

export function CommentThread({
  taskId,
  comments,
}: {
  taskId: string;
  comments: CommentRow[];
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setPending(true);
    setError("");
    const res = await fetch(`/api/tasks/${taskId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    const data = await res.json().catch(() => ({}));
    setPending(false);
    if (!res.ok) {
      setError(data.error || "Could not post comment");
      return;
    }
    setBody("");
    router.refresh();
  }

  return (
    <section className="mt-20 border-t border-line pt-12">
      <h2 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] uppercase leading-[0.9]">
        Comments
      </h2>
      {comments.length ? (
        <ul className="mt-8">
          {comments.map((c) => {
            const author =
              typeof c.authorId === "string" ? c.authorId : c.authorId?.name || "Teammate";
            const role = typeof c.authorId === "object" ? c.authorId?.role : undefined;
            return (
              <li key={c._id} className="border-b border-line py-6 first:border-t">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                  {author}
                  {role ? ` · ${role}` : ""}
                  <span className="mx-2 text-line">/</span>
                  {formatDateTime(c.createdAt)}
                </p>
                <p className="mt-3 max-w-xl whitespace-pre-wrap text-base leading-relaxed">{c.body}</p>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-6 text-sm text-muted">No comments yet. Leave a note for the team.</p>
      )}
      <form onSubmit={onSubmit} className="mt-10 max-w-xl space-y-4">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Update, question, or blocker…"
          className="ws-input min-h-[6rem]"
        />
        {error ? <p className="text-sm text-accent">{error}</p> : null}
        <button disabled={pending || !body.trim()} className="ws-btn disabled:opacity-50">
          {pending ? "Posting" : "Post comment"}
        </button>
      </form>
    </section>
  );
}
