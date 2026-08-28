import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { orgOverview } from "@/lib/reports";
import { listTasks } from "@/lib/tasks";
import { PageTitle } from "@/components/shell/PageTitle";
import { MetricRow, TaskIndexList } from "@/components/tasks/TaskIndexList";
import { EmptyState, Section } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { greetingLines } from "@/lib/utils";
import { WorkMarquee } from "@/components/tasks/WorkList";
import { idOf, serialize } from "@/lib/serialize";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/");
  await connectDB();
  const overview = await orgOverview();
  const { items: doneItems } = await listTasks(session.user, {
    status: "done",
    limit: "12",
  });
  const completed = serialize(doneItems);

  return (
    <>
      <PageTitle
        kicker="Organisation"
        lines={greetingLines(session.user?.name)}
        meta="Completion, risk, and each manager’s load"
        actions={
          <Link href="/admin/users" className="ws-btn ws-btn-fill">
            Manage people
          </Link>
        }
      />
      <MetricRow
        items={[
          { label: "Tasks", value: overview.total, href: "/admin/tasks" },
          { label: "Completion", value: `${overview.completionRate}%` },
          { label: "Done", value: overview.completed, href: "/admin/tasks?status=done" },
          {
            label: "Overdue",
            value: overview.overdue,
            href: "/admin/tasks?overdue=true",
            warn: overview.overdue > 0,
          },
        ]}
      />
      <WorkMarquee />
      <Section title="Managers">
        {overview.perManager.length ? (
          <ul className="divide-y divide-line border-y border-line">
            {overview.perManager.map((row) => (
              <li key={row.id}>
                <Link
                  href={`/admin/tasks?managerId=${row.id}`}
                  className="flex flex-col gap-3 py-4 hover:bg-[var(--row-hover)] md:flex-row md:items-center md:justify-between"
                >
                  <span className="inline-flex items-center gap-3">
                    <Avatar name={row.name} size="md" />
                    <span>{row.name}</span>
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                    {row.total} tasks · {row.completionRate}% done ·{" "}
                    <span className={row.overdue ? "text-[var(--status-waiting)]" : ""}>
                      {row.overdue} overdue
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No managers yet"
            body="Promote a teammate to manager, then attach users to them. That is how teams form."
            actionHref="/admin/users"
            actionLabel="Open people"
          />
        )}
      </Section>
      <Section title="Completed" hint="Latest finished work">
        <TaskIndexList
          tasks={completed.map((t) => ({
            _id: idOf(t),
            title: t.title,
            status: t.status,
            priority: t.priority,
            deadline: t.deadline,
            assignedTo: t.assignedTo as { name?: string },
            href: `/admin/tasks/${idOf(t)}`,
          }))}
          emptyTitle="Nothing completed yet"
          emptyBody="When someone marks a task done, it will show up here."
          emptyHref="/admin/tasks?status=done"
          emptyAction="All completed"
        />
      </Section>
    </>
  );
}
