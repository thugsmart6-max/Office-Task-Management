import { auth } from "@/lib/auth";
import { listTasks } from "@/lib/tasks";
import { PageTitle } from "@/components/shell/PageTitle";
import { MetricRow, TaskIndexList } from "@/components/tasks/TaskIndexList";
import { Section } from "@/components/ui/EmptyState";
import { addDays, greetingLines, startOfDay } from "@/lib/utils";
import { WorkMarquee } from "@/components/tasks/WorkList";
import { idOf, serialize } from "@/lib/serialize";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ManagerDashboardPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "manager" && session.user.role !== "admin")) {
    redirect("/");
  }

  const { items } = await listTasks(session.user, { limit: "200" });
  const tasks = serialize(items);
  const today = startOfDay();
  const week = addDays(today, 7);

  const byStatus = (s: string) => tasks.filter((t) => t.status === s).length;
  const upcoming = tasks.filter((t) => {
    const d = new Date(t.deadline);
    return d >= today && d <= week && t.status !== "done" && t.status !== "cancelled";
  });
  const overdue = tasks.filter(
    (t) =>
      new Date(t.deadline) < today && t.status !== "done" && t.status !== "cancelled",
  );
  const waiting = tasks.filter((t) => t.status === "waiting");
  const pending = tasks.filter((t) => t.status === "pending");
  const completed = tasks.filter((t) => t.status === "done");

  const toList = (rows: typeof tasks) =>
    rows.map((t) => ({
      _id: idOf(t),
      title: t.title,
      status: t.status,
      priority: t.priority,
      deadline: t.deadline,
      assignedTo: t.assignedTo as { name?: string },
      href: `/manager/tasks/${idOf(t)}/edit`,
    }));

  return (
    <>
      <PageTitle
        kicker="Team"
        lines={greetingLines(session.user.name)}
        meta="Unblock work, confirm admin pending tasks, watch deadlines"
        actions={
          <Link href="/manager/tasks/new" className="ws-btn ws-btn-fill">
            New task
          </Link>
        }
      />
      <MetricRow
        items={[
          { label: "Pending", value: pending.length, href: "/manager/tasks?status=pending" },
          {
            label: "Active",
            value: byStatus("confirmed") + byStatus("in_progress"),
            href: "/manager/tasks?status=in_progress",
          },
          { label: "Waiting", value: waiting.length, href: "/manager/tasks?status=waiting", warn: waiting.length > 0 },
          { label: "Done", value: byStatus("done"), href: "/manager/tasks?status=done" },
        ]}
      />
      <WorkMarquee />
      <Section title="Blocked & overdue" hint="Handle these first">
        <TaskIndexList
          tasks={toList([
            ...overdue,
            ...waiting.filter((t) => !overdue.some((o) => idOf(o) === idOf(t))),
          ])}
          emptyTitle="Team is unblocked"
          emptyBody="No overdue or waiting tasks. Confirm pending work next."
          emptyHref="/manager/tasks?status=pending"
          emptyAction="Review pending"
          quickStatus
          role={session.user.role}
        />
      </Section>
      <Section title="Due in 7 days">
        <TaskIndexList
          tasks={toList(upcoming)}
          emptyTitle="No deadlines this week"
          emptyBody="Create a task for someone on your team when you are ready."
          emptyHref="/manager/tasks/new"
          emptyAction="Create task"
          quickStatus
          role={session.user.role}
        />
      </Section>
      <Section title="Completed" hint="Recently done">
        <TaskIndexList
          tasks={toList(completed)}
          emptyTitle="Nothing completed yet"
          emptyBody="When your team marks work done, it will appear here."
          emptyHref="/manager/tasks?status=done"
          emptyAction="All completed"
        />
      </Section>
    </>
  );
}
