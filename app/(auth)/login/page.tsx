import { LoginForm } from "@/components/auth/AuthForms";
import { PageTitle } from "@/components/shell/PageTitle";
import { isGoogleEnabled } from "@/lib/google";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <>
      <PageTitle
        kicker="Sign in"
        title="Welcome back."
        meta="Google only. New people join the same way."
      />
      {params.error ? (
        <p className="mb-6 max-w-md text-sm text-[var(--status-waiting)]">
          Google sign-in did not finish. Try again.
        </p>
      ) : null}
      <LoginForm googleEnabled={isGoogleEnabled()} />
    </>
  );
}
