import { auth } from "@/lib/auth";
import { getTask } from "@/lib/tasks";
import { listUsers } from "@/lib/users";
import { PageTitle } from "@/components/shell/PageTitle";
import { TaskForm } from "@/components/tasks/TaskForm";
import { ConfirmTaskButton } from "@/components/tasks/ConfirmTaskButton";
import { CommentThread } from "@/components/tasks/CommentThread";
import { DeleteTaskButton } from "@/components/admin/DeleteTaskButton";
import { idOf, isoDate, serialize } from "@/lib/serialize";
import { listComments } from "@/lib/comments";
import { formatDateTime, statusLabel } from "@/lib/utils";
import { notFound, redirect } from "next/navigation";

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "manager" && session.user.role !== "admin")) {
    redirect("/");
  }
  const { id } = await params;
  const task = await getTask(session.user, id);
  if (!task) notFound();
  const users = serialize(await listUsers(session.user, "user"));
  const data = serialize(task);
  const comments = serialize(await listComments(session.user, id));
  const isAdmin = session.user.role === "admin";
  const ownTask = idOf(data.createdBy) === session.user.id;

  return (
    <>
      <PageTitle
        kicker={statusLabel(data.status)}
        title={data.title}
        meta={
          ownTask
            ? `Your task · updated ${formatDateTime(data.updatedAt)}`
            : `Admin task · updated ${formatDateTime(data.updatedAt)}`
        }
      />
      {data.status === "pending" ? <ConfirmTaskButton taskId={id} /> : null}
      {isAdmin || ownTask ? (
        <TaskForm
          action={`/api/tasks/${id}`}
          users={users.map((u) => ({ _id: idOf(u), name: u.name, email: u.email }))}
          initial={{
            title: data.title,
            description: data.description,
            assignedTo: idOf(data.assignedTo),
            startDate: isoDate(data.startDate),
            deadline: isoDate(data.deadline),
            priority: data.priority,
            status: data.status,
            blockedReason: data.blockedReason,
          }}
          canChangeStatus={isAdmin}
          statusOptions={
            isAdmin
              ? ["pending", "confirmed", "in_progress", "waiting", "done", "cancelled"]
              : undefined
          }
          redirectTo="/manager/tasks"
        />
      ) : (
        <p className="mb-8 max-w-xl text-sm text-muted">
          This task was created by admin. Confirm it to show it to the user. You cannot
          edit or delete admin tasks.
        </p>
      )}
      <CommentThread taskId={id} comments={comments} />
      {ownTask || isAdmin ? (
        <DeleteTaskButton id={id} redirectTo="/manager/tasks" />
      ) : null}
    </>
  );
}
