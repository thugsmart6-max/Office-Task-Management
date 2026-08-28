import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/session";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  const { user, error } = await requireApiUser();
  if (error) return error;

  await connectDB();
  const dbUser = await User.findById(user.id)
    .select("-passwordHash")
    .populate("managerId", "name email")
    .lean();

  return NextResponse.json({ user: dbUser });
}
