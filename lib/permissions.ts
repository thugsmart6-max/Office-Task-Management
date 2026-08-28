import { ITask } from "@/models/Task";
import { SessionUser, TaskStatus, USER_VISIBLE_STATUSES } from "@/types";

export function refId(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && "_id" in value) {
    return String((value as { _id: unknown })._id);
  }
  const asString = String(value);
  return asString === "[object Object]" ? "" : asString;
}

export function taskListFilter(
  user: SessionUser,
  showDeleted = false,
): Record<string, unknown> {
  const base: Record<string, unknown> =
    showDeleted && user.role === "admin" ? {} : { deleted: false };

  if (user.role === "admin") return base;

  if (user.role === "manager") {
    return {
      ...base,
      $or: [{ managerId: user.id }, { createdBy: user.id }],
    };
  }

  return {
    ...base,
    assignedTo: user.id,
    status: { $in: USER_VISIBLE_STATUSES },
  };
}

export function canViewTask(user: SessionUser, task: ITask) {
  if (user.role === "admin") return true;
  if (user.role === "manager") {
    return (
      refId(task.managerId) === user.id || refId(task.createdBy) === user.id
    );
  }
  return (
    refId(task.assignedTo) === user.id &&
    USER_VISIBLE_STATUSES.includes(task.status)
  );
}

export function canCreateTask(user: SessionUser) {
  return user.role === "admin" || user.role === "manager";
}

export function canEditTaskFields(user: SessionUser, task: ITask) {
  if (task.deleted) return false;
  if (user.role === "admin") return true;
  if (user.role === "manager") return refId(task.createdBy) === user.id;
  return false;
}

export function canDeleteTask(user: SessionUser, task?: ITask) {
  if (user.role === "admin") return true;
  if (user.role === "manager" && task) {
    return !task.deleted && refId(task.createdBy) === user.id;
  }
  return false;
}

export function canSetStatus(
  user: SessionUser,
  task: ITask,
  nextStatus: TaskStatus,
) {
  if (task.deleted) return false;
  if (user.role === "admin") return true;

  if (user.role === "user") {
    if (refId(task.assignedTo) !== user.id) return false;
    if (task.status !== "confirmed" && task.status !== "in_progress") return false;
    return nextStatus === "in_progress" || nextStatus === "done";
  }

  if (user.role === "manager") {
    const onTeam =
      refId(task.managerId) === user.id || refId(task.createdBy) === user.id;
    if (!onTeam) return false;
    return task.status === "pending" && nextStatus === "confirmed";
  }

  return false;
}

export function canAssignUser(actor: SessionUser, assigneeManagerId?: string) {
  if (actor.role === "admin") return true;
  if (actor.role === "manager") return assigneeManagerId === actor.id;
  return false;
}

export function canManageUsers(user: SessionUser) {
  return user.role === "admin";
}

export function canViewUsers(user: SessionUser) {
  return user.role === "admin" || user.role === "manager";
}
