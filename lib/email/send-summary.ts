import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { sendEmail } from "@/lib/email/provider";
import { managerSummaryEmail } from "@/lib/email/templates/manager-summary";
import { aggregateManagerSummary } from "@/lib/reports";
import { SessionUser } from "@/types";

export async function sendManagerSummary(
  actor: SessionUser | null,
  managerId: string,
  frequency: "daily" | "weekly" = "weekly",
) {
  if (actor) {
    if (actor.role === "manager" && actor.id !== managerId) {
      throw Object.assign(new Error("Forbidden"), { status: 403 });
    }
    if (actor.role === "user") {
      throw Object.assign(new Error("Forbidden"), { status: 403 });
    }
  }

  await connectDB();
  const summary = await aggregateManagerSummary(managerId, frequency);
  if (!summary) throw Object.assign(new Error("Manager not found"), { status: 404 });

  const admins = await User.find({ role: "admin" }).select("email").lean();
  const to = admins.map((a) => a.email).filter(Boolean);
  if (!to.length) throw Object.assign(new Error("No admin recipients"), { status: 400 });

  const payload = managerSummaryEmail(summary);
  await sendEmail({ to, ...payload });
  return summary;
}

export async function runDueSummaries() {
  await connectDB();
  const managers = await User.find({
    role: "manager",
    "emailPrefs.summaryEnabled": { $ne: false },
    "emailPrefs.summaryFrequency": { $in: ["daily", "weekly"] },
  }).lean();

  const weekday = new Date().getDay();
  const isMonday = weekday === 1;
  const results = [];

  for (const manager of managers) {
    const freq = manager.emailPrefs?.summaryFrequency || "weekly";
    if (freq === "off") continue;
    if (freq === "weekly" && !isMonday) continue;
    const period = freq === "daily" ? "daily" : "weekly";
    try {
      await sendManagerSummary(null, String(manager._id), period);
      results.push({ managerId: String(manager._id), ok: true });
    } catch (error) {
      results.push({
        managerId: String(manager._id),
        ok: false,
        error: error instanceof Error ? error.message : "failed",
      });
    }
  }

  return results;
}

export function jsonError(error: unknown) {
  const message = error instanceof Error ? error.message : "Server error";
  const status = (error as { status?: number }).status || 500;
  return NextResponse.json({ error: message }, { status });
}

export function parseSearch(req: NextRequest) {
  return Object.fromEntries(req.nextUrl.searchParams.entries());
}
