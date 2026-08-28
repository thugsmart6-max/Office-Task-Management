import { auth } from "@/lib/auth";
import { listUsers } from "@/lib/users";
import { PageTitle } from "@/components/shell/PageTitle";
import { PeopleBoard } from "@/components/admin/PeopleBoard";
import { idOf, serialize } from "@/lib/serialize";
import { JobRole } from "@/types";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/");
  const users = serialize(await listUsers(session.user));
  const managers = users
    .filter((u) => u.role === "manager")
    .map((u) => ({ _id: idOf(u), name: u.name }));

  return (
    <>
      <PageTitle
        kicker="Admin"
        title="People."
        meta="Desk is the work they do. Access is admin, manager, or member. Assign a manager so tasks can reach them."
      />
      <PeopleBoard
        people={users.map((u) => ({
          _id: idOf(u),
          name: u.name,
          email: u.email,
          image: u.image,
          role: u.role,
          jobRole: u.jobRole as JobRole | undefined,
          onboarded: u.onboarded !== false,
          managerId: u.managerId
            ? {
                _id: idOf(u.managerId),
                name:
                  typeof u.managerId === "object" && u.managerId && "name" in u.managerId
                    ? String(u.managerId.name)
                    : "",
              }
            : null,
        }))}
        managers={managers}
      />
    </>
  );
}
