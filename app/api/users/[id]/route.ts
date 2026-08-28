import { NextRequest, NextResponse } from "next/server";
import { requireApiUser } from "@/lib/session";
import { updateUser } from "@/lib/users";
import { jsonError } from "@/lib/email/send-summary";
import { JobRole, Role, SummaryFrequency } from "@/types";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { user, error } = await requireApiUser();
  if (error) return error;
  try {
    const { id } = await params;
    const body = (await req.json()) as {
      role?: Role;
      managerId?: string | null;
      jobRole?: JobRole;
      name?: string;
      emailPrefs?: {
        notifyOnTaskDone?: boolean;
        summaryFrequency?: SummaryFrequency;
        summaryEnabled?: boolean;
      };
    };
    const updated = await updateUser(user, id, body);
    return NextResponse.json({
      id: updated._id,
      role: updated.role,
      managerId: updated.managerId,
      jobRole: updated.jobRole,
      name: updated.name,
      onboarded: updated.onboarded,
      emailPrefs: updated.emailPrefs,
    });
  } catch (err) {
    return jsonError(err);
  }
}
