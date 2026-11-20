import { requireUser } from "@/lib/auth";
import { DeleteAccountForm, PasswordForm } from "../AccountForms";
import { logout } from "../actions/auth";
import PageHead from "../PageHead";

export default async function SettingsPage() {
  const user = await requireUser();
  return (
    <>
      <PageHead eyebrow="SETTINGS" title={<>Account <em>settings</em></>} text={`Signed in as ${user.email}`} />
      <div className="section-wrap page-body narrow settings-stack">
        <div className="form-card wide">
          <h2>Sign-in methods</h2>
          <ul className="signin-methods">
            <li><span>Email and password</span><strong>{user.hasPassword ? "On" : "Not set"}</strong></li>
            <li><span>Google</span><strong>{user.linked.includes("google") ? "Connected" : "Not connected"}</strong></li>
            <li><span>Apple</span><strong>{user.linked.includes("apple") ? "Connected" : "Not connected"}</strong></li>
          </ul>
          <p>To connect Google or Apple, log out and choose “Continue with Google/Apple” using an account with the same email.</p>
        </div>
        <PasswordForm hasPassword={user.hasPassword} />
        <form action={logout} className="form-card wide">
          <h2>Log out</h2>
          <p>Log out of Sentinel on this device.</p>
          <button className="button button-primary">Log out</button>
        </form>
        <DeleteAccountForm />
      </div>
    </>
  );
}
