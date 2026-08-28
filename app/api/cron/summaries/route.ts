import { NextRequest, NextResponse } from "next/server";
import { runDueSummaries } from "@/lib/email/send-summary";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const header = req.headers.get("authorization");
  if (!secret || header !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await runDueSummaries();
  return NextResponse.json({ ok: true, results });
}
