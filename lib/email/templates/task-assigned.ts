import { appUrl, formatDate } from "@/lib/utils";

export function taskAssignedEmail(input: {
  title: string;
  description?: string;
  deadline: Date | string;
  priority: string;
  assignerName: string;
  taskId: string;
}) {
  const link = `${appUrl()}/user/tasks/${input.taskId}`;
  const subject = `New task: ${input.title}`;
  const desc = input.description?.trim() || "No description.";
  const text = [
    `${input.assignerName} assigned you a task.`,
    `Task: ${input.title}`,
    `Priority: ${input.priority}`,
    `Deadline: ${formatDate(input.deadline)}`,
    `Details: ${desc}`,
    `Open: ${link}`,
  ].join("\n");

  const html = `
    <div style="font-family:Georgia,serif;background:#0c0c0c;color:#e8e8e4;padding:32px">
      <p style="letter-spacing:0.2em;font-size:11px;color:#8a8a84">NEW TASK</p>
      <h1 style="font-weight:400;font-size:28px">${input.title}</h1>
      <p>${input.assignerName} assigned this to you.</p>
      <p>Priority: ${input.priority}<br/>Deadline: ${formatDate(input.deadline)}</p>
      <p>${desc}</p>
      <p><a href="${link}" style="color:#c9b48a">Open task</a></p>
    </div>
  `;

  return { subject, html, text };
}
