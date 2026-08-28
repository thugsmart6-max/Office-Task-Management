import { auth } from "@/lib/auth";
import { getTask } from "@/lib/tasks";
import { listUsers } from "@/lib/users";
import { PageTitle } from "@/components/shell/PageTitle";
import { TaskForm } from "@/components/tasks/TaskForm";
import { ConfirmTaskButton } from "@/components/tasks/ConfirmTaskButton";
import { CommentThread } from "@/components/tasks/CommentThread";
import { DeleteTaskButton } from "@/components/admin/DeleteTaskButton";
import { idOf, isoDate, serialize } from "@/lib/serialize";
import { formatDateTime, statusLabel } from "@/lib/utils";
import { listComments } from "@/lib/comments";
import { notFound, redirect } from "next/navigation";

export default async function AdminTaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") redirect("/");
  const { id } = await params;
  const task = await getTask(session.user, id);
  if (!task) notFound();
  const users = serialize(await listUsers(session.user, "user"));
  const data = serialize(task);
  const comments = serialize(await listComments(session.user, id));

  return (
    <>
      <PageTitle
        kicker={statusLabel(data.status)}
        title={data.title}
        meta={`Updated ${formatDateTime(data.updatedAt)}`}
      />
      {data.status === "pending" ? <ConfirmTaskButton taskId={id} /> : null}
      <TaskForm
        action={`/api/tasks/${id}`}
        users={users.map((u) => ({
          _id: idOf(u),
          name: u.name,
          email: u.email,
        }))}
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
        canChangeStatus
        redirectTo="/admin/tasks"
      />
      <CommentThread taskId={id} comments={comments} />
      <DeleteTaskButton id={id} />
    </>
  );
}
