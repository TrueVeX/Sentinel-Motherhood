import { safeNext } from "@/lib/auth";
import { enabledProviders } from "@/lib/oauth";
import { redirectIfSignedIn } from "../actions/auth";
import { LoginForm } from "../AuthForms";
import OAuthButtons from "../OAuthButtons";
import PageHead from "../PageHead";

const ERRORS: Record<string, string> = {
  "google-not-setup": "Sign in with Google isn’t set up yet. Add the Google keys to the app’s settings first.",
  "apple-not-setup": "Sign in with Apple isn’t set up yet. Add the Apple keys to the app’s settings first.",
  "oauth-cancelled": "Sign-in was cancelled. You can try again or use your email.",
  "oauth-expired": "That sign-in was interrupted or took too long. Please try again.",
  "oauth-failed": "We couldn’t sign you in with that account. Please try again."
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  const target = safeNext(next) ?? "";
  // Already signed in? Never show the login page again; go where they were heading.
  await redirectIfSignedIn(target);
  const message = typeof error === "string" ? ERRORS[error] : undefined;

  return (
    <>
      <PageHead eyebrow="WELCOME BACK" title={<>Log in to <em>Sentinel</em></>} text={target ? "Please log in to continue. We’ll take you straight back." : undefined} />
      <div className="section-wrap page-body narrow">
        {message && <p className="notice" role="alert">{message}</p>}
        <OAuthButtons providers={enabledProviders()} next={target} />
        <LoginForm next={target} />
      </div>
    </>
  );
}
