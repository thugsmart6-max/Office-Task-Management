import { z } from "zod";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import Task, { ITask } from "@/models/Task";
import User from "@/models/User";
import { sendEmail } from "@/lib/email/provider";
import { taskCompletedEmail } from "@/lib/email/templates/task-completed";
import { taskAssignedEmail } from "@/lib/email/templates/task-assigned";
import {
  canAssignUser,
  canCreateTask,
  canDeleteTask,
  canEditTaskFields,
  canSetStatus,
  canViewTask,
  taskListFilter,
} from "@/lib/permissions";
import { SessionUser, TaskStatus } from "@/types";
import { hydrateSessionUser } from "@/lib/session";

export const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  assignedTo: z.string().min(1),
  managerId: z.string().optional(),
  startDate: z.string().or(z.date()),
  deadline: z.string().or(z.date()),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  status: z.enum(["pending", "confirmed"]).optional(),
});

export const patchTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  assignedTo: z.string().optional(),
  startDate: z.string().or(z.date()).optional(),
  deadline: z.string().or(z.date()).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  status: z
    .enum(["pending", "confirmed", "in_progress", "waiting", "done", "cancelled"])
    .optional(),
  blockedReason: z.string().optional(),
  completionNote: z.string().optional(),
});

function asDate(value: string | Date) {
  return value instanceof Date ? value : new Date(value);
}

async function resolveManagerId(
  actor: SessionUser,
  assignee: { managerId?: Types.ObjectId; role: string },
) {
  if (assignee.managerId) return assignee.managerId;
  if (actor.role === "manager") return new Types.ObjectId(actor.id);
  throw new Error("Assignee has no manager. Assign a manager first.");
}

export async function listTasks(
  actor: SessionUser,
  query: {
    status?: string;
    assignedTo?: string;
    managerId?: string;
    priority?: string;
    from?: string;
    to?: string;
    overdue?: string;
    q?: string;
    showDeleted?: string;
    page?: string;
    limit?: string;
  },
) {
  await connectDB();
  actor = await hydrateSessionUser(actor);
  const filter = taskListFilter(actor, query.showDeleted === "true");

  if (query.status) filter.status = query.status;
  if (query.assignedTo) filter.assignedTo = query.assignedTo;
  if (query.managerId && actor.role === "admin") filter.managerId = query.managerId;
  if (query.priority) filter.priority = query.priority;
  if (query.from || query.to) {
    filter.deadline = {
      ...(query.from ? { $gte: new Date(query.from) } : {}),
      ...(query.to ? { $lte: new Date(query.to) } : {}),
    };
  }
  if (query.q) {
    filter.title = { $regex: query.q, $options: "i" };
  }
  if (query.overdue === "true") {
    filter.deadline = { ...(filter.deadline as object), $lt: new Date() };
    filter.status = { $nin: ["done", "cancelled"] };
  }

  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(query.limit || 50)));
  const sort: Record<string, 1 | -1> =
    query.status === "done"
      ? { completedAt: -1, updatedAt: -1 }
      : { deadline: 1 };

  const [items, total] = await Promise.all([
    Task.find(filter)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .populate("managerId", "name email")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Task.countDocuments(filter),
  ]);

  return { items, total, page, limit };
}

export async function getTask(actor: SessionUser, id: string) {
  await connectDB();
  actor = await hydrateSessionUser(actor);
  const task = await Task.findById(id)
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email")
    .populate("managerId", "name email")
    .lean();
  if (!task) return null;
  if (!canViewTask(actor, task as ITask)) return null;
  return task;
}

export async function createTask(
  actor: SessionUser,
  input: z.infer<typeof createTaskSchema>,
) {
  await connectDB();
  actor = await hydrateSessionUser(actor);
  if (!canCreateTask(actor)) {
    throw Object.assign(new Error("Forbidden"), { status: 403 });
  }

  const assignee = await User.findById(input.assignedTo);
  if (!assignee) throw Object.assign(new Error("Assignee not found"), { status: 400 });

  if (
    !canAssignUser(
      actor,
      assignee.managerId?.toString() ||
        (actor.role === "manager" ? actor.id : undefined),
    )
  ) {
    throw Object.assign(new Error("Cannot assign this user"), { status: 403 });
  }

  const startDate = asDate(input.startDate);
  const deadline = asDate(input.deadline);
  if (deadline < startDate) {
    throw Object.assign(new Error("deadline must be >= startDate"), { status: 400 });
  }

  if (actor.role === "admin" && input.managerId) {
    assignee.managerId = new Types.ObjectId(input.managerId);
    await assignee.save();
  }

  if (actor.role === "manager" && !assignee.managerId) {
    assignee.managerId = new Types.ObjectId(actor.id);
    await assignee.save();
  }

  const managerId = await resolveManagerId(actor, assignee);

  // Admin work starts pending (manager must confirm) unless admin confirms now.
  // Manager-created work is already confirmed and shows to the user.
  const status: TaskStatus =
    actor.role === "manager"
      ? "confirmed"
      : input.status === "confirmed"
        ? "confirmed"
        : "pending";

  const task = await Task.create({
    title: input.title,
    description: input.description,
    assignedTo: assignee._id,
    createdBy: actor.id,
    managerId,
    startDate,
    deadline,
    priority: input.priority,
    status,
  });

  if (status === "confirmed") {
    await notifyAssigneeAssigned(task, actor.name);
  }

  return task;
}

export async function patchTask(
  actor: SessionUser,
  id: string,
  input: z.infer<typeof patchTaskSchema>,
) {
  await connectDB();
  actor = await hydrateSessionUser(actor);
  const task = await Task.findById(id);
  if (!task || (task.deleted && actor.role !== "admin")) {
    throw Object.assign(new Error("Not found"), { status: 404 });
  }
  if (!canViewTask(actor, task)) {
    throw Object.assign(new Error("Forbidden"), { status: 403 });
  }

  const fieldKeys = ["title", "description", "assignedTo", "startDate", "deadline", "priority"] as const;
  const wantsFields = fieldKeys.some((k) => input[k] !== undefined);
  const canFields = canEditTaskFields(actor, task);
  const statusChanging = Boolean(input.status && input.status !== task.status);

  // Managers may confirm / change status on admin-created team tasks, but
  // cannot rewrite title, assignee, or dates unless they created the task.
  if (wantsFields && !canFields && !statusChanging) {
    throw Object.assign(new Error("Cannot edit this task"), { status: 403 });
  }

  if (canFields) {
    if (input.assignedTo) {
      const assignee = await User.findById(input.assignedTo);
      if (!assignee) throw Object.assign(new Error("Assignee not found"), { status: 400 });
      if (!canAssignUser(actor, assignee.managerId?.toString())) {
        throw Object.assign(new Error("Cannot assign this user"), { status: 403 });
      }
      task.assignedTo = assignee._id;
      task.managerId = assignee.managerId || task.managerId;
    }

    if (input.title) task.title = input.title;
    if (input.description !== undefined) task.description = input.description;
    if (input.priority) task.priority = input.priority;
    if (input.startDate) task.startDate = asDate(input.startDate);
    if (input.deadline) task.deadline = asDate(input.deadline);
    if (task.deadline < task.startDate) {
      throw Object.assign(new Error("deadline must be >= startDate"), { status: 400 });
    }
  }

  const prevStatus = task.status;
  if (input.status && input.status !== task.status) {
    if (!canSetStatus(actor, task, input.status as TaskStatus)) {
      throw Object.assign(new Error("Cannot change to that status"), { status: 403 });
    }
    task.status = input.status;
    if (input.status === "waiting") {
      task.blockedReason = input.blockedReason || task.blockedReason;
      if (!task.blockedReason?.trim()) {
        throw Object.assign(new Error("blockedReason required"), { status: 400 });
      }
    }
    if (input.status === "done") {
      task.completedAt = new Date();
      if (input.completionNote !== undefined) {
        task.completionNote = input.completionNote;
      }
    }
  } else if (input.completionNote !== undefined && canSetStatus(actor, task, "done")) {
    task.completionNote = input.completionNote;
  }

  if (input.blockedReason !== undefined && (actor.role === "admin" || canFields)) {
    task.blockedReason = input.blockedReason;
  }

  await task.save();

  if (prevStatus === "pending" && task.status === "confirmed") {
    await notifyAssigneeAssigned(task, actor.name);
  }

  if (prevStatus !== "done" && task.status === "done") {
    try {
      await notifyManagerTaskDone(task);
    } catch (error) {
      console.error("[email] completion failed", error);
    }
  }

  return task;
}

async function notifyManagerTaskDone(task: ITask) {
  const [manager, assignee] = await Promise.all([
    User.findById(task.managerId),
    User.findById(task.assignedTo),
  ]);
  if (!manager?.email) return;
  if (manager.emailPrefs?.notifyOnTaskDone === false) return;

  const payload = taskCompletedEmail({
    title: task.title,
    userName: assignee?.name || "User",
    deadline: task.deadline,
    completedAt: task.completedAt || new Date(),
    note: task.completionNote,
    taskId: String(task._id),
  });

  await sendEmail({ to: manager.email, ...payload });
}

export async function softDeleteTask(actor: SessionUser, id: string) {
  await connectDB();
  actor = await hydrateSessionUser(actor);
  const task = await Task.findById(id);
  if (!task || (task.deleted && actor.role !== "admin")) {
    throw Object.assign(new Error("Not found"), { status: 404 });
  }
  if (!canDeleteTask(actor, task)) {
    throw Object.assign(new Error("Forbidden"), { status: 403 });
  }
  task.deleted = true;
  await task.save();
  return task;
}

async function notifyAssigneeAssigned(task: ITask, assignerName?: string | null) {
  const assignee = await User.findById(task.assignedTo);
  if (!assignee?.email) return;
  try {
    const payload = taskAssignedEmail({
      title: task.title,
      description: task.description,
      deadline: task.deadline,
      priority: task.priority,
      assignerName: assignerName || "Your manager",
      taskId: String(task._id),
    });
    await sendEmail({ to: assignee.email, ...payload });
  } catch (error) {
    console.error("[email] assign failed", error);
  }
}
