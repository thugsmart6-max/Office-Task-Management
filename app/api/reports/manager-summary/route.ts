import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/session";
import { jsonError } from "@/lib/email/send-summary";
import { sendManagerSummary } from "@/lib/email/send-summary";
import { aggregateManagerSummary } from "@/lib/reports";
import { connectDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { user, error } = await requireApiUser();
  if (error) return error;
  try {
    await connectDB();
    const managerId =
      req.nextUrl.searchParams.get("managerId") ||
      (user.role === "manager" ? user.id : null);
    const frequency =
      (req.nextUrl.searchParams.get("frequency") as "daily" | "weekly") || "weekly";
    if (!managerId) {
      return NextResponse.json({ error: "managerId required" }, { status: 400 });
    }
    if (user.role === "manager" && managerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (user.role === "user") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const summary = await aggregateManagerSummary(managerId, frequency);
    return NextResponse.json(summary);
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireApiUser();
  if (error) return error;
  try {
    const body = (await req.json().catch(() => ({}))) as {
      managerId?: string;
      frequency?: "daily" | "weekly";
    };
    const managerId = body.managerId || (user.role === "manager" ? user.id : null);
    if (!managerId) {
      return NextResponse.json({ error: "managerId required" }, { status: 400 });
    }
    const summary = await sendManagerSummary(
      user,
      managerId,
      body.frequency || "weekly",
    );
    return NextResponse.json({ ok: true, summary });
  } catch (err) {
    return jsonError(err);
  }
}
