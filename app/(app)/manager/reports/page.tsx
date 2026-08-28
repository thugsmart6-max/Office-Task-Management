import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { aggregateManagerSummary } from "@/lib/reports";
import { PageTitle } from "@/components/shell/PageTitle";
import { MetricRow, TaskIndexList } from "@/components/tasks/TaskIndexList";
import { ReportsActions } from "@/components/reports/ReportsActions";
import { Section } from "@/components/ui/EmptyState";
import { redirect } from "next/navigation";
import { TaskStatus } from "@/types";

export default async function ManagerReportsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "manager") redirect("/");
  await connectDB();
  const me = await User.findById(session.user.id).lean();
  const freq = me?.emailPrefs?.summaryFrequency || "weekly";
  const period = freq === "daily" ? "daily" : "weekly";
  const summary = await aggregateManagerSummary(session.user.id, period);
  if (!summary) redirect("/");

  return (
    <>
      <PageTitle
        kicker="Reports"
        title="Summary."
        meta={summary.dateRange}
      />
      <ReportsActions managerId={session.user.id} frequency={freq} />
      <MetricRow
        items={[
          { label: "Created", value: summary.created },
          { label: "Completed", value: summary.completed },
          { label: "Pending", value: summary.pending },
          { label: "Overdue", value: summary.overdue },
        ]}
      />
      <Section title="Overdue">
      <TaskIndexList
        tasks={summary.overdueTasks.map((t) => ({
          _id: t.id,
          title: t.title,
          status: t.status as TaskStatus,
          priority: "high",
          deadline: t.deadline,
          assignedTo: t.assigneeName,
          href: `/manager/tasks/${t.id}/edit`,
        }))}
      />
      </Section>
      <Section title="Waiting">
      <TaskIndexList
        tasks={summary.waitingTasks.map((t) => ({
          _id: t.id,
          title: t.title,
          status: t.status as TaskStatus,
          priority: "medium",
          deadline: t.deadline,
          assignedTo: t.assigneeName,
          href: `/manager/tasks/${t.id}/edit`,
        }))}
      />
      </Section>
      <Section title="Completed">
      <TaskIndexList
        tasks={summary.completedTasks.map((t) => ({
          _id: t.id,
          title: t.title,
          status: t.status as TaskStatus,
          priority: "medium",
          deadline: t.deadline,
          assignedTo: t.assigneeName,
          href: `/manager/tasks/${t.id}/edit`,
        }))}
        emptyTitle="No completed work yet"
        emptyBody="Finished tasks for your team will list here."
      />
      </Section>
    </>
  );
}
