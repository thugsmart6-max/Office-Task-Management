import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { SessionUser } from "@/types";
import { NextResponse } from "next/server";

export async function hydrateSessionUser(
  user: SessionUser,
): Promise<SessionUser> {
  const email = user.email?.trim().toLowerCase();
  if (!email) return user;

  await connectDB();
  const dbUser = await User.findOne({ email });
  if (!dbUser) return user;

  return {
    id: dbUser._id.toString(),
    name: dbUser.name,
    email: dbUser.email,
    image: dbUser.image,
    role: dbUser.role,
    managerId: dbUser.managerId?.toString(),
    jobRole: dbUser.jobRole,
    onboarded: dbUser.onboarded !== false,
  };
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user) return null;
  return hydrateSessionUser(session.user);
}

export async function requireApiUser() {
  const user = await getSessionUser();
  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { user, error: null };
}
