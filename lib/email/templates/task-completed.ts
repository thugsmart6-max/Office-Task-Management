import { appUrl, formatDateTime } from "@/lib/utils";

export function taskCompletedEmail(input: {
  title: string;
  userName: string;
  deadline: Date | string;
  completedAt: Date | string;
  note?: string;
  taskId: string;
}) {
  const link = `${appUrl()}/manager/tasks/${input.taskId}/edit`;
  const subject = `Task Completed: ${input.title} – ${input.userName}`;
  const note = input.note?.trim() || "No note provided.";
  const text = [
    `Task: ${input.title}`,
    `Completed by: ${input.userName}`,
    `Deadline: ${formatDateTime(input.deadline)}`,
    `Completed at: ${formatDateTime(input.completedAt)}`,
    `Note: ${note}`,
    `Link: ${link}`,
  ].join("\n");

  const html = `
    <div style="font-family:Georgia,serif;background:#0c0c0c;color:#e8e8e4;padding:32px">
      <p style="letter-spacing:0.2em;font-size:11px;color:#8a8a84">TASK COMPLETED</p>
      <h1 style="font-weight:400;font-size:28px">${input.title}</h1>
      <p>${input.userName} marked this task done.</p>
      <p>Deadline: ${formatDateTime(input.deadline)}<br/>Completed: ${formatDateTime(input.completedAt)}</p>
      <p>Note: ${note}</p>
      <p><a href="${link}" style="color:#c9b48a">Open task</a></p>
    </div>
  `;

  return { subject, html, text };
}
