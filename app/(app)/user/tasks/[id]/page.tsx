import { auth } from "@/lib/auth";
import { getTask } from "@/lib/tasks";
import { hydrateSessionUser } from "@/lib/session";
import { InProgressButton, MarkDoneForm } from "@/components/tasks/MarkDoneForm";
import { CommentThread } from "@/components/tasks/CommentThread";
import { serialize } from "@/lib/serialize";
import { listComments } from "@/lib/comments";
import {
  formatDate,
  formatDateTime,
  isOverdue,
  relativeDue,
  statusLabel,
} from "@/lib/utils";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export default async function UserTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const actor = await hydrateSessionUser(session.user);
  const { id } = await params;
  const task = await getTask(actor, id);
  if (!task) notFound();
  const data = serialize(task);
  const comments = serialize(await listComments(actor, id));
  const canAct =
    actor.role === "user" &&
    (data.status === "confirmed" || data.status === "in_progress");
  const overdue = isOverdue(data.deadline, data.status);

  return (
    <article>
      <p className="mb-12">
        <Link href="/user/dashboard" className="text-[15px] text-muted hover:text-fg">
          ← Work
        </Link>
      </p>

      <p className="ws-case-kicker">{statusLabel(data.status)}</p>
      <h1 className="ws-case-title mt-1">{data.title}</h1>
      <p className="mt-6 text-lg text-muted">
        {data.priority}
        <span className="mx-2">/</span>
        {relativeDue(data.deadline, data.status)}
      </p>

      {overdue ? <p className="mt-4 text-accent">Past the deadline.</p> : null}

      {data.description ? (
        <p className="mt-12 max-w-2xl text-xl leading-relaxed">{data.description}</p>
      ) : null}

      <dl className="mt-14 grid grid-cols-2 gap-x-10 gap-y-8 border-y border-line py-10 sm:grid-cols-4">
        <Fact label="Start" value={formatDate(data.startDate)} />
        <Fact label="Deadline" value={formatDate(data.deadline)} />
        <Fact label="Priority" value={data.priority} />
        {data.completedAt ? (
          <Fact label="Completed" value={formatDateTime(data.completedAt)} />
        ) : (
          <Fact label="Due" value={relativeDue(data.deadline, data.status)} />
        )}
        {data.blockedReason ? <Fact label="Blocked" value={data.blockedReason} /> : null}
        {data.completionNote ? <Fact label="Note" value={data.completionNote} /> : null}
      </dl>

      {canAct && data.status === "confirmed" ? (
        <div className="mt-10">
          <InProgressButton taskId={id} />
        </div>
      ) : null}
      {canAct ? <MarkDoneForm taskId={id} /> : null}
      {data.status === "done" ? (
        <p className="mt-10 max-w-xl text-muted">Complete. Your manager has a record of it.</p>
      ) : null}

      <CommentThread taskId={id} comments={comments} />
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-1 text-lg">{value}</dd>
    </div>
  );
}
