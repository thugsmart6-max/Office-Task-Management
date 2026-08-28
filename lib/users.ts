import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Task from "@/models/Task";
import { canManageUsers, canViewUsers } from "@/lib/permissions";
import { JobRole, Role, SessionUser, SummaryFrequency } from "@/types";

export async function listUsers(actor: SessionUser, role?: string) {
  if (!canViewUsers(actor)) {
    throw Object.assign(new Error("Forbidden"), { status: 403 });
  }
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (actor.role === "manager") {
    filter.managerId = actor.id;
  }
  if (role) filter.role = role;
  return User.find(filter)
    .select("-passwordHash")
    .populate("managerId", "name email")
    .sort({ name: 1 })
    .lean();
}

export async function updateUser(
  actor: SessionUser,
  id: string,
  input: {
    role?: Role;
    managerId?: string | null;
    jobRole?: JobRole;
    name?: string;
    emailPrefs?: {
      notifyOnTaskDone?: boolean;
      summaryFrequency?: SummaryFrequency;
      summaryEnabled?: boolean;
    };
  },
) {
  const isSelfPrefs =
    actor.id === id && input.emailPrefs && !input.role && input.managerId === undefined && !input.jobRole && !input.name;
  const isSelfOnboard =
    actor.id === id &&
    Boolean(input.name && input.jobRole) &&
    !input.role &&
    input.managerId === undefined &&
    !input.emailPrefs;

  if (!isSelfPrefs && !isSelfOnboard && !canManageUsers(actor)) {
    throw Object.assign(new Error("Forbidden"), { status: 403 });
  }

  await connectDB();
  const user = await User.findById(id);
  if (!user) throw Object.assign(new Error("Not found"), { status: 404 });

  if (input.role && canManageUsers(actor)) {
    user.role = input.role;
    if (input.role !== "user") user.managerId = undefined;
  }
  if (input.managerId !== undefined && canManageUsers(actor)) {
    user.managerId = input.managerId ? new Types.ObjectId(input.managerId) : undefined;
  }
  if (input.jobRole && (canManageUsers(actor) || isSelfOnboard)) {
    user.jobRole = input.jobRole;
  }
  if (input.name?.trim() && (canManageUsers(actor) || isSelfOnboard)) {
    user.name = input.name.trim();
  }
  if (isSelfOnboard) {
    user.onboarded = true;
  }
  if (input.emailPrefs) {
    user.emailPrefs = {
      ...user.emailPrefs,
      ...input.emailPrefs,
    };
  }

  await user.save();

  if (user.managerId) {
    await Task.updateMany(
      { assignedTo: user._id, deleted: false },
      { managerId: user.managerId },
    );
  }

  return user;
}
