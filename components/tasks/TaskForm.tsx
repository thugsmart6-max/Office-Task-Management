"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Priority, TaskStatus } from "@/types";

type UserOption = { _id: string; name: string; email: string };

export function TaskForm({
  action,
  users,
  managers,
  initial,
  canChangeStatus,
  statusOptions,
  redirectTo,
}: {
  action: string;
  users: UserOption[];
  managers?: UserOption[];
  initial?: {
    title?: string;
    description?: string;
    assignedTo?: string;
    managerId?: string;
    startDate?: string;
    deadline?: string;
    priority?: Priority;
    status?: TaskStatus;
    blockedReason?: string;
  };
  canChangeStatus?: boolean;
  statusOptions?: TaskStatus[];
  redirectTo: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [status, setStatus] = useState(initial?.status || "pending");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const method =
      action.includes("/api/tasks/") && !action.endsWith("/api/tasks")
        ? "PATCH"
        : "POST";

    const res = await fetch(action, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setPending(false);
    if (!res.ok) {
      setError(data.error || "Could not save task");
      return;
    }
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-5">
      <Field label="Title" name="title" defaultValue={initial?.title} required />
      <label className="block">
        <span className="ws-label">Description</span>
        <textarea
          name="description"
          defaultValue={initial?.description}
          rows={4}
          className="ws-input min-h-[7rem]"
        />
      </label>
      <label className="block">
        <span className="ws-label">Assign to</span>
        <select
          name="assignedTo"
          defaultValue={initial?.assignedTo}
          required
          className="ws-select"
        >
          <option value="">Select teammate</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name} ({u.email})
            </option>
          ))}
        </select>
      </label>
      {managers?.length ? (
        <label className="block">
          <span className="ws-label">Manager</span>
          <select
            name="managerId"
            defaultValue={initial?.managerId}
            className="ws-select"
          >
            <option value="">Use teammate’s current manager</option>
            {managers.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name} ({m.email})
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Start"
          name="startDate"
          type="date"
          defaultValue={initial?.startDate}
          required
        />
        <Field
          label="Deadline"
          name="deadline"
          type="date"
          defaultValue={initial?.deadline}
          required
        />
      </div>
      <label className="block">
        <span className="ws-label">Priority</span>
        <select
          name="priority"
          defaultValue={initial?.priority || "medium"}
          className="ws-select"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>
      {canChangeStatus ? (
        <>
          <label className="block">
            <span className="ws-label">Status</span>
            <select
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="ws-select"
            >
              {(statusOptions || [
                "pending",
                "confirmed",
                "in_progress",
                "waiting",
                "done",
                "cancelled",
              ]).map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </label>
          {status === "waiting" ? (
            <Field
              label="Blocked reason"
              name="blockedReason"
              defaultValue={initial?.blockedReason}
              required
            />
          ) : null}
          {(statusOptions || []).includes("pending") ? (
            <p className="text-sm text-muted">
              Pending stays with the manager. Confirmed is visible to the assigned user.
            </p>
          ) : null}
        </>
      ) : null}
      {error ? <p className="text-sm text-[var(--status-waiting)]">{error}</p> : null}
      <button disabled={pending} className="ws-btn ws-btn-fill w-full disabled:opacity-50 sm:w-auto">
        {pending ? "Saving" : "Save task"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="ws-label">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="ws-input"
      />
    </label>
  );
}
