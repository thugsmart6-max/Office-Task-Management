"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { MetricRow } from "@/components/tasks/TaskIndexList";
import { Banner, Section } from "@/components/ui/EmptyState";
import { JOB_ROLES, JobRole, Role, jobRoleLabel } from "@/types";

export type PersonRow = {
  _id: string;
  name: string;
  email: string;
  image?: string | null;
  role: Role;
  jobRole?: JobRole;
  onboarded?: boolean;
  managerId?: { _id: string; name: string } | null;
};

export function PeopleBoard({
  people,
  managers,
}: {
  people: PersonRow[];
  managers: { _id: string; name: string }[];
}) {
  const waitingDesk = people.filter((p) => p.onboarded === false);
  const needsManager = people.filter(
    (p) => p.role === "user" && p.onboarded !== false && !p.managerId,
  );
  const wantsAccess = people.filter(
    (p) => p.role === "user" && (p.jobRole === "manager" || p.jobRole === "admin"),
  );

  return (
    <>
      <MetricRow
        items={[
          { label: "People", value: people.length },
          { label: "Managers", value: managers.length },
          {
            label: "Need a manager",
            value: needsManager.length,
            warn: needsManager.length > 0,
          },
          {
            label: "Access asks",
            value: wantsAccess.length,
            warn: wantsAccess.length > 0,
          },
        ]}
      />

      {waitingDesk.length ? (
        <Banner tone="warn">
          {waitingDesk.length === 1 ? "One person has" : `${waitingDesk.length} people have`}{" "}
          not finished name and desk yet.
        </Banner>
      ) : null}

      {wantsAccess.length ? (
        <Banner>
          {wantsAccess.length === 1 ? "One member asked" : `${wantsAccess.length} members asked`}{" "}
          for manager or admin access. Set Access on their row to confirm.
        </Banner>
      ) : null}

      <Section title="The office" hint="Desk is their work. Access is what they can do.">
        <ul className="ws-strip">
          {people.map((person) => (
            <PersonStrip
              key={person._id}
              person={person}
              managers={managers}
              highlight={
                person.role === "user" &&
                (person.jobRole === "manager" || person.jobRole === "admin")
              }
            />
          ))}
        </ul>
      </Section>
    </>
  );
}

function PersonStrip({
  person,
  managers,
  highlight,
}: {
  person: PersonRow;
  managers: { _id: string; name: string }[];
  highlight?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const managerId = person.managerId?._id || "";

  async function patch(body: object) {
    setPending(true);
    await fetch(`/api/users/${person._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setPending(false);
    router.refresh();
  }

  return (
    <li
      className={`flex flex-col gap-4 py-4 sm:py-5 md:flex-row md:items-center md:justify-between ${
        highlight ? "bg-[var(--row-hover)]" : ""
      }`}
    >
      <div className="flex min-w-0 items-center gap-3 md:w-64">
        <Avatar name={person.name} image={person.image} size="md" />
        <div className="min-w-0">
          <p className="truncate text-[16px] text-fg">{person.name}</p>
          <p className="truncate text-[13px] text-muted">{person.email}</p>
        </div>
      </div>

      <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="text-xs">
          <span className="ws-label">Desk</span>
          <select
            disabled={pending}
            value={person.jobRole || ""}
            className="ws-select ws-select-sm w-full"
            onChange={(e) => {
              if (e.target.value) patch({ jobRole: e.target.value });
            }}
          >
            <option value="">Not set</option>
            {JOB_ROLES.map((job) => (
              <option key={job.id} value={job.id}>
                {job.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs">
          <span className="ws-label">Access</span>
          <select
            disabled={pending}
            value={person.role}
            className="ws-select ws-select-sm w-full"
            onChange={(e) => patch({ role: e.target.value })}
          >
            <option value="user">Member</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <label className="text-xs">
          <span className="ws-label">Reports to</span>
          <select
            disabled={pending || person.role !== "user"}
            value={managerId}
            className="ws-select ws-select-sm w-full"
            onChange={(e) => patch({ managerId: e.target.value || null })}
          >
            <option value="">Unassigned</option>
            {managers.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {person.onboarded === false ? (
        <p className="shrink-0 text-[11px] font-semibold uppercase tracking-widest text-accent">
          Onboarding
        </p>
      ) : person.role === "user" && !managerId ? (
        <p className="shrink-0 text-[11px] font-semibold uppercase tracking-widest text-accent">
          Needs manager
        </p>
      ) : person.jobRole ? (
        <p className="hidden shrink-0 text-[11px] font-semibold uppercase tracking-widest text-muted lg:block">
          {jobRoleLabel(person.jobRole)}
        </p>
      ) : null}
    </li>
  );
}
