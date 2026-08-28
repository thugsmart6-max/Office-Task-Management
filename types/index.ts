export type Role = "admin" | "manager" | "user";

/** Desk / function a person works in. Access is still Role. */
export type JobRole =
  | "editor"
  | "developer"
  | "admin"
  | "manager"
  | "digital_marketing";

export const JOB_ROLES: { id: JobRole; label: string; hint: string }[] = [
  { id: "editor", label: "Editor", hint: "Copy, content, and reviews" },
  { id: "developer", label: "Developer", hint: "Build and ship the work" },
  {
    id: "digital_marketing",
    label: "Digital marketing",
    hint: "Campaigns, ads, and growth",
  },
  {
    id: "manager",
    label: "Manager",
    hint: "Run a team — admin confirms access",
  },
  {
    id: "admin",
    label: "Admin",
    hint: "Office-wide access — admin confirms",
  },
];

export function jobRoleLabel(job?: JobRole | null) {
  return JOB_ROLES.find((j) => j.id === job)?.label ?? "—";
}

export type TaskStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "waiting"
  | "done"
  | "cancelled";

export type Priority = "low" | "medium" | "high";

export type SummaryFrequency = "daily" | "weekly" | "off";

export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: Role;
  managerId?: string;
  jobRole?: JobRole;
  onboarded?: boolean;
};

/** Users never see pending work. Admin/manager confirm first. */
export const USER_VISIBLE_STATUSES: TaskStatus[] = [
  "confirmed",
  "in_progress",
  "waiting",
  "done",
];
