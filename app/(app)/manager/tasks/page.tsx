import Link from "next/link";
import { auth } from "@/lib/auth";
import { listTasks } from "@/lib/tasks";
import { listUsers } from "@/lib/users";
import { PageTitle } from "@/components/shell/PageTitle";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { TaskIndexList } from "@/components/tasks/TaskIndexList";
import { idOf, serialize } from "@/lib/serialize";
import { redirect } from "next/navigation";

export default async function ManagerTasksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "manager" && session.user.role !== "admin")) {
    redirect("/");
  }
  const params = await searchParams;
  const { items } = await listTasks(session.user, {
    status: params.status,
    assignedTo: params.assignedTo,
    priority: params.priority,
    from: params.from,
    to: params.to,
    q: params.q,
  });
  const team = serialize(await listUsers(session.user));

  return (
    <>
      <PageTitle
        kicker="Manager"
        title="Tasks."
        meta="Create for your team, confirm admin pending work. You can delete only your own tasks."
        actions={
          <Link
            href="/manager/tasks/new"
            className="ws-btn ws-btn-fill"
          >
            New task
          </Link>
        }
      />
      <TaskFilters
        action="/manager/tasks"
        values={{
          status: params.status,
          priority: params.priority,
          from: params.from,
          to: params.to,
          q: params.q,
        }}
        statuses={["pending", "confirmed", "in_progress", "waiting", "done"]}
        extra={
          <label className="text-xs">
            <span className="ws-label">Assignee</span>
            <select
              name="assignedTo"
              defaultValue={params.assignedTo || ""}
              className="ws-select"
            >
              <option value="">All</option>
              {team.map((u) => (
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
          href: `/manager/tasks/${idOf(t)}/edit`,
        }))}
        emptyTitle="No tasks match"
        emptyBody="Create a task or clear filters."
        emptyHref="/manager/tasks/new"
        emptyAction="New task"
        quickStatus
        role={session.user.role}
      />
    </>
  );
}
