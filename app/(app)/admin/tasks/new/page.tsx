import { auth } from "@/lib/auth";
import { listUsers } from "@/lib/users";
import { PageTitle } from "@/components/shell/PageTitle";
import { TaskForm } from "@/components/tasks/TaskForm";
import { idOf, serialize } from "@/lib/serialize";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminNewTaskPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/");
  const people = serialize(await listUsers(session.user));
  const assignees = people.filter((u) => u.role === "user" || u.role === "manager");
  const managers = people.filter((u) => u.role === "manager");

  return (
    <>
      <p className="mb-6">
        <Link
          href="/admin/tasks"
          className="text-xs uppercase tracking-[0.18em] text-muted hover:text-fg"
        >
          ← All tasks
        </Link>
      </p>
      <PageTitle
        kicker="Admin"
        title="New task."
        meta="Starts pending for the manager. Confirm it if the user should see it now."
      />
      {assignees.length ? (
        <TaskForm
          action="/api/tasks"
          users={assignees.map((u) => ({
            _id: idOf(u),
            name: u.name,
            email: u.email,
          }))}
          managers={managers.map((u) => ({
            _id: idOf(u),
            name: u.name,
            email: u.email,
          }))}
          initial={{ status: "pending" }}
          canChangeStatus
          statusOptions={["pending", "confirmed"]}
          redirectTo="/admin/tasks"
        />
      ) : (
        <p className="text-muted">
          Add people first and set at least one manager on the People page.
        </p>
      )}
    </>
  );
}
