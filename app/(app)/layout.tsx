import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { hydrateSessionUser } from "@/lib/session";
import Task from "@/models/Task";
import { AppShell } from "@/components/shell/AppShell";
import { startOfDay } from "@/lib/utils";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  await connectDB();
  const actor = await hydrateSessionUser(session.user);
  if (actor.onboarded === false) redirect("/onboarding");
  const overdue = await Task.countDocuments({
    deleted: false,
    status: { $nin: ["done", "cancelled"] },
    deadline: { $lt: startOfDay() },
    ...(actor.role === "admin"
      ? {}
      : actor.role === "manager"
        ? { $or: [{ managerId: actor.id }, { createdBy: actor.id }] }
        : { assignedTo: actor.id, status: { $nin: ["pending", "done", "cancelled"] } }),
  });

  return (
    <AppShell
      role={actor.role}
      name={actor.name}
      overdue={overdue}
    >
      {children}
    </AppShell>
  );
}
