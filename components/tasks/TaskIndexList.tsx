import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { QuickStatusButtons } from "@/components/tasks/QuickStatusButtons";
import { formatDate, isOverdue, relativeDue, statusLabel } from "@/lib/utils";
import { Priority, Role, TaskStatus } from "@/types";

export type TaskListItem = {
  _id: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  deadline: string | Date;
  completedAt?: string | Date;
  assignedTo?: { name?: string } | string;
  href: string;
};

export function TaskIndexList({
  tasks,
  emptyTitle = "Nothing here",
  emptyBody = "When work lands in this view, it will show up as a list you can scan in seconds.",
  emptyHref,
  emptyAction,
  quietEmpty,
  quickStatus,
  role,
}: {
  tasks: TaskListItem[];
  emptyTitle?: string;
  emptyBody?: string;
  emptyHref?: string;
  emptyAction?: string;
  quietEmpty?: boolean;
  quickStatus?: boolean;
  role?: Role;
}) {
  if (!tasks.length) {
    if (quietEmpty) {
      return <p className="text-sm text-muted">None right now.</p>;
    }
    return (
      <EmptyState
        title={emptyTitle}
        body={emptyBody}
        actionHref={emptyHref}
        actionLabel={emptyAction}
      />
    );
  }

  return (
    <ul className="ws-strip">
      {tasks.map((task) => {
        const assignee =
          typeof task.assignedTo === "string"
            ? task.assignedTo
            : task.assignedTo?.name || "";
        const overdue = isOverdue(task.deadline, task.status);
        return (
          <li
            key={task._id}
            className="group flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:py-4"
          >
            <Link
              href={task.href}
              className="flex min-w-0 flex-1 flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-6"
            >
              <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
                <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted sm:w-[6.5rem]">
                  {statusLabel(task.status)}
                </span>
                <span className="line-clamp-2 text-[15px] text-fg group-hover:text-accent sm:truncate sm:text-[16px]">
                  {task.title}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-widest text-muted sm:pl-[6.5rem] md:gap-5 md:pl-0">
                {assignee ? (
                  <span className="inline-flex items-center gap-2 normal-case tracking-normal">
                    <Avatar name={assignee} />
                    <span className="max-w-[8rem] truncate">{assignee}</span>
                  </span>
                ) : null}
                <span className={task.priority === "high" ? "text-accent" : undefined}>
                  {task.priority}
                </span>
                <span className={overdue ? "text-accent" : ""}>
                  {relativeDue(task.deadline, task.status)}
                </span>
                <span className="hidden tabular-nums lg:inline">{formatDate(task.deadline)}</span>
              </div>
            </Link>
            {quickStatus && role ? (
              <QuickStatusButtons taskId={task._id} status={task.status} role={role} />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export function MetricRow({
  items,
}: {
  items: { label: string; value: string | number; href?: string; warn?: boolean }[];
}) {
  return (
    <div className="mb-5 grid grid-cols-2 gap-2 sm:mb-6 sm:gap-3 md:grid-cols-4">
      {items.map((item) => {
        const inner = (
          <div className="ws-frame bg-bg px-3 py-3.5 transition-colors hover:bg-[var(--row-hover)] sm:px-4 sm:py-5">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted sm:text-[10px] sm:tracking-[0.2em]">
              {item.label}
            </p>
            <p
              className={`mt-2 font-display text-[1.75rem] uppercase tabular-nums sm:mt-3 sm:text-4xl ${
                item.warn ? "text-accent" : ""
              }`}
            >
              {item.value}
            </p>
          </div>
        );
        return item.href ? (
          <Link key={item.label} href={item.href}>
            {inner}
          </Link>
        ) : (
          <div key={item.label}>{inner}</div>
        );
      })}
    </div>
  );
}
