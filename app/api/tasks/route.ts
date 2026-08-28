import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/session";
import { createTask, createTaskSchema, listTasks } from "@/lib/tasks";
import { jsonError, parseSearch } from "@/lib/email/send-summary";

export async function GET(req: NextRequest) {
  const { user, error } = await requireApiUser();
  if (error) return error;
  const data = await listTasks(user, parseSearch(req));
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireApiUser();
  if (error) return error;
  try {
    const body = createTaskSchema.parse(await req.json());
    const task = await createTask(user, body);
    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    return jsonError(err);
  }
}
