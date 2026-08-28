import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/session";
import { getTask, patchTask, patchTaskSchema, softDeleteTask } from "@/lib/tasks";
import { jsonError } from "@/lib/email/send-summary";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { user, error } = await requireApiUser();
  if (error) return error;
  const { id } = await params;
  const task = await getTask(user, id);
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(task);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { user, error } = await requireApiUser();
  if (error) return error;
  try {
    const { id } = await params;
    const body = patchTaskSchema.parse(await req.json());
    const task = await patchTask(user, id, body);
    return NextResponse.json(task);
  } catch (err) {
    return jsonError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { user, error } = await requireApiUser();
  if (error) return error;
  try {
    const { id } = await params;
    const task = await softDeleteTask(user, id);
    return NextResponse.json({ ok: true, id: task._id });
  } catch (err) {
    return jsonError(err);
  }
}
