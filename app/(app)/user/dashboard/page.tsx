import { auth } from "@/lib/auth";
import { listTasks } from "@/lib/tasks";
import { hydrateSessionUser } from "@/lib/session";
import { PageTitle } from "@/components/shell/PageTitle";
import { MetricRow, TaskIndexList } from "@/components/tasks/TaskIndexList";
import { WorkMarquee } from "@/components/tasks/WorkList";
import { Banner, Section } from "@/components/ui/EmptyState";
import { greetingLines, startOfDay, addDays } from "@/lib/utils";
import { idOf, serialize } from "@/lib/serialize";
import { Priority } from "@/types";
import { redirect } from "next/navigation";

const priorityRank: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

export default async function UserDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const actor = await hydrateSessionUser(session.user);
  const { items } = await listTasks(actor, { limit: "100" });
  const tasks = serialize(items);
  const today = startOfDay();
  const tomorrow = addDays(today, 1);

  const open = sortWork(
    tasks.filter((t) => t.status !== "done" && t.status !== "cancelled"),
  );
  const waiting = open.filter((t) => t.status === "confirmed");
  const inProgress = open.filter((t) => t.status === "in_progress");
  const high = open.filter((t) => t.priority === "high");
  const todays = open.filter((t) => {
    const d = new Date(t.deadline);
    return d >= today && d < tomorrow;
  });
  const overdue = open.filter((t) => new Date(t.deadline) < today);
  const done = [...tasks.filter((t) => t.status === "done")].sort((a, b) => {
    const aTime = new Date(a.completedAt || a.updatedAt || a.deadline).getTime();
    const bTime = new Date(b.completedAt || b.updatedAt || b.deadline).getTime();
    return bTime - aTime;
  });

  const toList = (rows: typeof tasks) =>
    rows.map((t) => ({
      _id: idOf(t),
      title: t.title,
      status: t.status,
      priority: t.priority,
      deadline: t.deadline,
      completedAt: t.completedAt,
      href: `/user/tasks/${idOf(t)}`,
    }));

  return (
    <>
      <PageTitle
        kicker="My work"
        lines={greetingLines(actor.name)}
        meta="Start waiting work. Finish what’s in progress. Done lives in the feed."
      />

      {!actor.managerId && actor.role === "user" ? (
        <Banner tone="warn">
          You are not on a team yet. Ask an admin to assign your manager so tasks can reach you.
        </Banner>
      ) : null}

      <MetricRow
        items={[
          { label: "To start", value: waiting.length },
          { label: "In progress", value: inProgress.length },
          { label: "Today", value: todays.length },
          { label: "High", value: high.length, warn: high.length > 0 },
        ]}
      />

      <WorkMarquee />

      <Section title="Live" hint={overdue.length ? `${overdue.length} overdue` : undefined}>
        <TaskIndexList
          tasks={toList(open)}
          emptyTitle="Caught up"
          emptyBody="When a task is confirmed for you, it shows up here."
          quickStatus
          role={actor.role}
        />
      </Section>

      <Section title="In your feed" hint="Completed">
        <TaskIndexList
          tasks={toList(done)}
          emptyTitle="No finished work yet"
          emptyBody="Marked-done tasks move here."
        />
      </Section>
    </>
  );
}

function sortWork<T extends { priority: Priority; deadline: string | Date; status: string }>(
  rows: T[],
) {
  const statusRank: Record<string, number> = {
    in_progress: 0,
    confirmed: 1,
    waiting: 2,
  };
  return [...rows].sort((a, b) => {
    const overdueA = new Date(a.deadline) < startOfDay() ? 0 : 1;
    const overdueB = new Date(b.deadline) < startOfDay() ? 0 : 1;
    if (overdueA !== overdueB) return overdueA - overdueB;
    const byStatus = (statusRank[a.status] ?? 9) - (statusRank[b.status] ?? 9);
    if (byStatus) return byStatus;
    const byPriority = priorityRank[a.priority] - priorityRank[b.priority];
    if (byPriority) return byPriority;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });
}
