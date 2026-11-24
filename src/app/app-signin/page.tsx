import { cookies } from "next/headers";
import Link from "next/link";
import { HANDOFF_COOKIE, handoffForTicket } from "@/lib/app-signin";
import PageHead from "../PageHead";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in the app" };

// Shown in the normal browser after Google/Apple, when the sign-in was started from the desktop app.
export default async function AppSignInPage({ searchParams }: { searchParams: Promise<{ done?: string }> }) {
  const { done } = await searchParams;
  const handoff = await handoffForTicket((await cookies()).get(HANDOFF_COOKIE)?.value);

  if (done || handoff?.confirmed) {
    return (
      <>
        <PageHead eyebrow="ALL DONE" title={<>You’re signed in to <em>the app</em></>} text="Go back to the Sentinel app. It will open your account in a moment. You can close this tab." />
      </>
    );
  }

  if (!handoff) {
    return (
      <>
        <PageHead eyebrow="SIGN IN THE APP" title={<>This link has <em>expired</em></>} text="Go back to the Sentinel app and press the Google or Apple button again." />
        <div className="section-wrap page-body narrow">
          <Link className="button button-primary" href="/login">Log in on this website instead</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHead eyebrow="SIGN IN THE APP" title={<>Does your app show <em>this code?</em></>} text="Check that the Sentinel app on this computer shows the same code, then confirm." />
      <div className="section-wrap page-body narrow">
        <p className="app-signin-code" aria-label={`Code ${handoff.code.split("").join(" ")}`}>
          {handoff.code.slice(0, 3)} {handoff.code.slice(3)}
        </p>
        <form action="/api/auth/app/confirm" method="post">
          <button className="button button-primary app-signin-confirm" type="submit">Yes, sign in the app</button>
        </form>
        <p className="app-signin-note">Didn’t start this in the Sentinel app, or the code is different? Close this tab. Nothing will happen.</p>
      </div>
    </>
  );
}
