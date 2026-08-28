import { TaskStatus } from "@/types";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(value?: Date | string | null) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(value?: Date | string | null) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function isOverdue(deadline: Date | string, status: TaskStatus) {
  if (status === "done" || status === "cancelled") return false;
  return new Date(deadline) < startOfDay();
}

export function relativeDue(deadline: Date | string, status: TaskStatus) {
  if (status === "done") return "Completed";
  if (status === "cancelled") return "Cancelled";
  const due = startOfDay(new Date(deadline));
  const today = startOfDay();
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return "Due today";
  if (diff === 1) return "Due tomorrow";
  if (diff <= 7) return `Due in ${diff}d`;
  return formatDate(deadline);
}

export function greetingLines(name?: string | null) {
  const hour = new Date().getHours();
  const line2 = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";
  const who = name?.trim().split(/\s+/)[0] || "";
  return who ? ["Good", line2, who] : ["Good", line2];
}

export function greetingFor(name?: string | null) {
  return greetingLines(name).join(" ");
}

export function initials(name?: string | null) {
  if (!name?.trim()) return "•";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
}

export function taskHref(role: string | undefined, id: string) {
  if (role === "admin") return `/admin/tasks/${id}`;
  if (role === "manager") return `/manager/tasks/${id}/edit`;
  return `/user/tasks/${id}`;
}

export function appUrl() {
  return (
    process.env.AUTH_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.APP_URL ||
    "http://localhost:3000"
  );
}

export function statusLabel(status: TaskStatus) {
  const labels: Record<TaskStatus, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    in_progress: "In progress",
    waiting: "Waiting",
    done: "Done",
    cancelled: "Cancelled",
  };
  return labels[status];
}

export function toObjectIdString(value: unknown) {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value && "_id" in value) {
    return String((value as { _id: unknown })._id);
  }
  return String(value);
}
