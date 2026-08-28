import type { ReactNode } from "react";
import { TaskStatus } from "@/types";

export function TaskFilters({
  action,
  statuses,
  extra,
  values,
}: {
  action: string;
  statuses: TaskStatus[];
  extra?: ReactNode;
  values?: {
    status?: string;
    priority?: string;
    from?: string;
    to?: string;
    q?: string;
  };
}) {
  return (
    <form
      method="get"
      action={action}
      className="mb-6 grid grid-cols-1 gap-3 border-y border-line py-4 sm:mb-8 sm:grid-cols-2 md:flex md:flex-wrap md:items-end md:gap-4"
    >
      <label className="min-w-0 text-xs sm:col-span-2 md:min-w-[12rem] md:flex-1">
        <span className="ws-label">Search</span>
        <input
          name="q"
          defaultValue={values?.q}
          placeholder="Title…"
          className="ws-input"
        />
      </label>
      <label className="text-xs">
        <span className="ws-label">Status</span>
        <select
          name="status"
          defaultValue={values?.status || ""}
          className="ws-select"
        >
          <option value="">All</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs">
        <span className="ws-label">Priority</span>
        <select
          name="priority"
          defaultValue={values?.priority || ""}
          className="ws-select"
        >
          <option value="">All</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>
      <label className="text-xs">
        <span className="ws-label">From</span>
        <input
          type="date"
          name="from"
          defaultValue={values?.from}
          className="ws-input"
        />
      </label>
      <label className="text-xs">
        <span className="ws-label">To</span>
        <input
          type="date"
          name="to"
          defaultValue={values?.to}
          className="ws-input"
        />
      </label>
      {extra}
      <button className="ws-btn w-full sm:col-span-2 md:w-auto">Apply</button>
    </form>
  );
}
