import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/session";
import { listUsers } from "@/lib/users";
import { jsonError } from "@/lib/email/send-summary";

export async function GET(req: NextRequest) {
  const { user, error } = await requireApiUser();
  if (error) return error;
  try {
    const role = req.nextUrl.searchParams.get("role") || undefined;
    const users = await listUsers(user, role);
    return NextResponse.json(users);
  } catch (err) {
    return jsonError(err);
  }
}
