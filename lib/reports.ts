import Task from "@/models/Task";
import User from "@/models/User";
import { formatDate, startOfDay, addDays } from "@/lib/utils";

export type SummaryTaskRow = {
  id: string;
  title: string;
  assigneeName: string;
  deadline: string;
  blockedReason?: string;
  status: string;
};

export type ManagerSummary = {
  managerId: string;
  managerName: string;
  dateRange: string;
  from: Date;
  to: Date;
  created: number;
  completed: number;
  pending: number;
  overdue: number;
  waiting: number;
  overdueTasks: SummaryTaskRow[];
  waitingTasks: SummaryTaskRow[];
  completedTasks: SummaryTaskRow[];
};

function periodRange(frequency: "daily" | "weekly") {
  const to = new Date();
  const from = frequency === "daily" ? addDays(to, -1) : addDays(to, -7);
  return { from, to };
}

export async function aggregateManagerSummary(
  managerId: string,
  frequency: "daily" | "weekly" = "weekly",
): Promise<ManagerSummary | null> {
  const manager = await User.findById(managerId).lean();
  if (!manager) return null;

  const { from, to } = periodRange(frequency);
  const today = startOfDay();

  const teamTasks = await Task.find({
    managerId,
    deleted: false,
  })
    .populate("assignedTo", "name email")
    .lean();

  const created = teamTasks.filter(
    (t) => t.createdAt >= from && t.createdAt <= to,
  ).length;
  const completed = teamTasks.filter(
    (t) => t.status === "done" && t.completedAt && t.completedAt >= from && t.completedAt <= to,
  ).length;
  const pending = teamTasks.filter((t) => t.status === "pending").length;
  const overdueTasks = teamTasks.filter(
    (t) =>
      t.status !== "done" &&
      t.status !== "cancelled" &&
      new Date(t.deadline) < today,
  );
  const waitingTasks = teamTasks.filter((t) => t.status === "waiting");
  const completedTasks = teamTasks
    .filter((t) => t.status === "done")
    .sort((a, b) => {
      const aTime = (a.completedAt || a.updatedAt).getTime();
      const bTime = (b.completedAt || b.updatedAt).getTime();
      return bTime - aTime;
    });

  const toRow = (t: (typeof teamTasks)[number]): SummaryTaskRow => {
    const assignee = t.assignedTo as unknown as { name?: string } | null;
    return {
      id: String(t._id),
      title: t.title,
      assigneeName: assignee?.name || "Unknown",
      deadline: formatDate(t.deadline),
      blockedReason: t.blockedReason,
      status: t.status,
    };
  };

  return {
    managerId: String(manager._id),
    managerName: manager.name,
    dateRange: `${formatDate(from)} – ${formatDate(to)}`,
    from,
    to,
    created,
    completed,
    pending,
    overdue: overdueTasks.length,
    waiting: waitingTasks.length,
    overdueTasks: overdueTasks.map(toRow),
    waitingTasks: waitingTasks.map(toRow),
    completedTasks: completedTasks.map(toRow),
  };
}

export async function orgOverview() {
  const [managers, tasks] = await Promise.all([
    User.find({ role: "manager" }).lean(),
    Task.find({ deleted: false }).lean(),
  ]);

  const today = startOfDay();
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const overdue = tasks.filter(
    (t) =>
      t.status !== "done" &&
      t.status !== "cancelled" &&
      new Date(t.deadline) < today,
  ).length;

  const perManager = managers.map((manager) => {
    const mt = tasks.filter((t) => String(t.managerId) === String(manager._id));
    const completed = mt.filter((t) => t.status === "done").length;
    const overdueCount = mt.filter(
      (t) =>
        t.status !== "done" &&
        t.status !== "cancelled" &&
        new Date(t.deadline) < today,
    ).length;
    return {
      id: String(manager._id),
      name: manager.name,
      email: manager.email,
      total: mt.length,
      completed,
      completionRate: mt.length ? Math.round((completed / mt.length) * 100) : 0,
      overdue: overdueCount,
    };
  });

  return {
    total,
    completed: done,
    completionRate: total ? Math.round((done / total) * 100) : 0,
    overdue,
    perManager,
  };
}
