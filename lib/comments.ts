import { z } from "zod";
import { connectDB } from "@/lib/db";
import Comment from "@/models/Comment";
import { getTask } from "@/lib/tasks";
import { hydrateSessionUser } from "@/lib/session";
import { SessionUser } from "@/types";

export const createCommentSchema = z.object({
  body: z.string().trim().min(1).max(2000),
});

export async function listComments(actor: SessionUser, taskId: string) {
  actor = await hydrateSessionUser(actor);
  const task = await getTask(actor, taskId);
  if (!task) throw Object.assign(new Error("Not found"), { status: 404 });

  await connectDB();
  return Comment.find({ taskId })
    .populate("authorId", "name email role")
    .sort({ createdAt: 1 })
    .lean();
}

export async function addComment(
  actor: SessionUser,
  taskId: string,
  input: z.infer<typeof createCommentSchema>,
) {
  actor = await hydrateSessionUser(actor);
  const task = await getTask(actor, taskId);
  if (!task) throw Object.assign(new Error("Not found"), { status: 404 });

  await connectDB();
  const comment = await Comment.create({
    taskId,
    authorId: actor.id,
    body: input.body,
  });

  return Comment.findById(comment._id).populate("authorId", "name email role").lean();
}
