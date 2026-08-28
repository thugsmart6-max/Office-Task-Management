import { appUrl } from "@/lib/utils";
import { ManagerSummary } from "@/lib/reports";

export function managerSummaryEmail(summary: ManagerSummary) {
  const subject = `Task Summary – ${summary.managerName} – ${summary.dateRange}`;
  const dashboard = `${appUrl()}/admin/dashboard`;
  const tasks = `${appUrl()}/admin/tasks?managerId=${summary.managerId}`;

  const overdueList =
    summary.overdueTasks
      .map((t) => `- ${t.title} (${t.assigneeName}) due ${t.deadline}`)
      .join("\n") || "- None";
  const waitingList =
    summary.waitingTasks
      .map((t) => `- ${t.title}: ${t.blockedReason || "waiting"}`)
      .join("\n") || "- None";

  const text = [
    `Manager: ${summary.managerName}`,
    `Period: ${summary.dateRange}`,
    `Created: ${summary.created}`,
    `Completed: ${summary.completed}`,
    `Pending: ${summary.pending}`,
    `Overdue: ${summary.overdue}`,
    "",
    "Overdue tasks:",
    overdueList,
    "",
    "Waiting / blocked:",
    waitingList,
    "",
    `Dashboard: ${dashboard}`,
    `Tasks: ${tasks}`,
  ].join("\n");

  const html = `
    <div style="font-family:Georgia,serif;background:#0c0c0c;color:#e8e8e4;padding:32px">
      <p style="letter-spacing:0.2em;font-size:11px;color:#8a8a84">MANAGER SUMMARY</p>
      <h1 style="font-weight:400;font-size:28px">${summary.managerName}</h1>
      <p>${summary.dateRange}</p>
      <p>Created ${summary.created} · Completed ${summary.completed} · Pending ${summary.pending} · Overdue ${summary.overdue}</p>
      <h2 style="font-size:16px;font-weight:400">Overdue</h2>
      <pre style="font-family:ui-monospace,monospace;white-space:pre-wrap">${overdueList}</pre>
      <h2 style="font-size:16px;font-weight:400">Waiting</h2>
      <pre style="font-family:ui-monospace,monospace;white-space:pre-wrap">${waitingList}</pre>
      <p><a href="${dashboard}" style="color:#c9b48a">Admin dashboard</a> · <a href="${tasks}" style="color:#c9b48a">Tasks</a></p>
    </div>
  `;

  return { subject, html, text };
}
