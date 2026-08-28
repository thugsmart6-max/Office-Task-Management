import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { hydrateSessionUser } from "@/lib/session";
import { PageTitle } from "@/components/shell/PageTitle";
import { OnboardingForm } from "@/components/auth/OnboardingForm";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const actor = await hydrateSessionUser(session.user);
  if (actor.onboarded !== false) redirect("/");

  return (
    <>
      <PageTitle
        kicker="New here"
        title="Who are you."
        meta="Name and desk. An admin sets office access after."
      />
      <OnboardingForm userId={actor.id} defaultName={actor.name || ""} />
    </>
  );
}
