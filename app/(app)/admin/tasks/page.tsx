import { auth } from "@/lib/auth";
import { listTasks } from "@/lib/tasks";
import { listUsers } from "@/lib/users";
import { PageTitle } from "@/components/shell/PageTitle";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { TaskIndexList } from "@/components/tasks/TaskIndexList";
import { idOf, serialize } from "@/lib/serialize";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminTasksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/");
  const params = await searchParams;
  const { items } = await listTasks(session.user, {
    status: params.status,
    assignedTo: params.assignedTo,
    managerId: params.managerId,
    priority: params.priority,
    from: params.from,
    to: params.to,
    overdue: params.overdue,
    q: params.q,
    showDeleted: params.showDeleted,
  });
  const users = serialize(await listUsers(session.user));

  return (
    <>
      <PageTitle
        kicker="Admin"
        title="All tasks."
        meta="New tasks start pending for the manager. Confirm to send them to the user."
        actions={
          <Link href="/admin/tasks/new" className="ws-btn ws-btn-fill">
            New task
          </Link>
        }
      />
      <TaskFilters
        action="/admin/tasks"
        values={{
          status: params.status,
          priority: params.priority,
          from: params.from,
          to: params.to,
          q: params.q,
        }}
        statuses={[
          "pending",
          "confirmed",
          "in_progress",
          "waiting",
          "done",
          "cancelled",
        ]}
        extra={
          <label className="text-xs">
            <span className="ws-label">Manager</span>
            <select
              name="managerId"
              defaultValue={params.managerId || ""}
              className="ws-select"
            >
              <option value="">All</option>
              {users
                .filter((u) => u.role === "manager")
                .map((u) => (
                  <option key={idOf(u)} value={idOf(u)}>
                    {u.name}
                  </option>
                ))}
            </select>
          </label>
        }
      />
      <TaskIndexList
        tasks={serialize(items).map((t) => ({
          _id: idOf(t),
          title: t.title,
          status: t.status,
          priority: t.priority,
          deadline: t.deadline,
          assignedTo: t.assignedTo as { name?: string },
          href: `/admin/tasks/${idOf(t)}`,
        }))}
        emptyTitle="No matching tasks"
        emptyBody="Create a task for someone in the office, or widen the filters."
        emptyHref="/admin/tasks/new"
        emptyAction="New task"
        quickStatus
        role="admin"
      />
    </>
  );
}
