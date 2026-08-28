import { auth } from "@/lib/auth";
import { listUsers } from "@/lib/users";
import { PageTitle } from "@/components/shell/PageTitle";
import { TaskForm } from "@/components/tasks/TaskForm";
import { idOf, serialize } from "@/lib/serialize";
import { redirect } from "next/navigation";

export default async function NewTaskPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "manager" && session.user.role !== "admin")) {
    redirect("/");
  }
  const users = serialize(await listUsers(session.user, "user"));

  return (
    <>
      <PageTitle
        kicker="Create"
        title="New task."
        meta="Your task goes straight to the teammate. You can delete only tasks you created."
      />
      <TaskForm
        action="/api/tasks"
        users={users.map((u) => ({ _id: idOf(u), name: u.name, email: u.email }))}
        redirectTo="/manager/tasks"
      />
    </>
  );
}
