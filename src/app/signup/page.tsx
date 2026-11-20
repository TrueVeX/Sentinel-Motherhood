import { enabledProviders } from "@/lib/oauth";
import { redirectIfSignedIn } from "../actions/auth";
import { SignupForm } from "../AuthForms";
import OAuthButtons from "../OAuthButtons";
import PageHead from "../PageHead";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ journey?: string; next?: string }> }) {
  const { journey, next } = await searchParams;
  await redirectIfSignedIn(next);
  const pick = typeof journey === "string" && ["pregnancy", "birth", "motherhood"].includes(journey) ? journey : "";

  return (
    <>
      <PageHead eyebrow="JOIN SENTINEL" title={<>Create your <em>free account</em></>} text="Your journal, appointments and dashboard are private to you." />
      <div className="section-wrap page-body narrow">
        {/* After Google/Apple, new accounts go to onboarding, keeping the chosen journey. */}
        <OAuthButtons providers={enabledProviders()} next={pick ? `/onboarding?journey=${pick}` : ""} verb="Sign up" />
        <SignupForm journey={pick} />
      </div>
    </>
  );
}
