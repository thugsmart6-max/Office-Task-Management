"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { JOB_ROLES, JobRole } from "@/types";
import { cn } from "@/lib/utils";

export function OnboardingForm({
  userId,
  defaultName,
}: {
  userId: string;
  defaultName: string;
}) {
  const router = useRouter();
  const { update } = useSession();
  const [name, setName] = useState(defaultName);
  const [jobRole, setJobRole] = useState<JobRole | "">("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!jobRole) {
      setError("Pick the desk you work on.");
      return;
    }
    setPending(true);
    setError("");
    const res = await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, jobRole }),
    });
    const data = await res.json().catch(() => ({}));
    setPending(false);
    if (!res.ok) {
      setError(data.error || "Could not save");
      return;
    }
    await update();
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-8">
      <label className="block">
        <span className="ws-label">Your name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
          className="ws-input"
          placeholder="What should we call you"
        />
      </label>

      <fieldset>
        <legend className="ws-label">What kind of role</legend>
        <div className="grid gap-2">
          {JOB_ROLES.map((job) => (
            <button
              key={job.id}
              type="button"
              onClick={() => setJobRole(job.id)}
              className={cn(
                "ws-frame flex flex-col items-start px-4 py-3 text-left transition-colors",
                jobRole === job.id
                  ? "border-fg bg-[var(--row-hover)]"
                  : "hover:bg-[var(--row-hover)]",
              )}
            >
              <span className="text-[14px] font-semibold uppercase tracking-wide">
                {job.label}
              </span>
              <span className="mt-1 text-[13px] text-muted">{job.hint}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {error ? <p className="text-sm text-[var(--status-waiting)]">{error}</p> : null}

      <button disabled={pending} className="ws-btn ws-btn-fill w-full disabled:opacity-50">
        {pending ? "Saving" : "Join the office"}
      </button>
    </form>
  );
}
