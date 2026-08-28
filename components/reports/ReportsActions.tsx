"use client";

import { SummaryFrequency } from "@/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReportsActions({
  managerId,
  frequency,
}: {
  managerId: string;
  frequency: SummaryFrequency;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function send() {
    setPending(true);
    setMessage("");
    const period = frequency === "daily" ? "daily" : "weekly";
    const res = await fetch("/api/reports/manager-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ managerId, frequency: period }),
    });
    const data = await res.json().catch(() => ({}));
    setPending(false);
    setMessage(res.ok ? "Summary sent to admin." : data.error || "Failed");
  }

  async function setFreq(next: SummaryFrequency) {
    await fetch(`/api/users/${managerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emailPrefs: {
          summaryFrequency: next,
          summaryEnabled: next !== "off",
        },
      }),
    });
    router.refresh();
  }

  return (
    <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex gap-2">
        {(["daily", "weekly", "off"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFreq(f)}
            className={`border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] ${
              frequency === f ? "border-fg text-fg" : "border-line text-muted"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <button
        onClick={send}
        disabled={pending}
        className="ws-btn ws-btn-fill"
      >
        {pending ? "Sending" : "Send summary to admin"}
      </button>
      {message ? <p className="text-sm text-muted">{message}</p> : null}
    </div>
  );
}
