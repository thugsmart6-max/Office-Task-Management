"use client";

import { useSearchParams } from "next/navigation";
import { GoogleButton } from "@/components/auth/GoogleButton";

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";

  if (!googleEnabled) {
    return (
      <p className="max-w-md text-sm text-[var(--status-waiting)]">
        Google is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to
        .env.local.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <GoogleButton label="Continue with Google" callbackUrl={callbackUrl} />
      <p className="mt-8 text-sm leading-relaxed text-muted">
        New here? Same button. We will ask your name and desk after Google.
      </p>
    </div>
  );
}
