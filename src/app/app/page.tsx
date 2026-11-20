import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, homeFor } from "@/lib/auth";
import { BrandMark } from "../Header";

export const metadata = { title: "Sentinel Motherhood" };

const TILES = [
  { href: "/pregnancy", icon: "✳", label: "Pregnancy" },
  { href: "/baby-development", icon: "◷", label: "Baby development" },
  { href: "/newborn-care", icon: "☼", label: "Baby care" },
  { href: "/mother-care", icon: "♡", label: "Mother care" },
  { href: "/tools", icon: "✓", label: "Tools" },
  { href: "/ai-assistant", icon: "✎", label: "Ask the AI" }
];

/**
 * The app's start screen (used by the installed Windows/Android app instead of the cinematic
 * homepage). Signed-in people go straight to their dashboard.
 */
export default async function AppStart() {
  const user = await getCurrentUser();
  if (user) redirect(homeFor(user));

  return (
    <section className="app-start">
      <div className="app-hero">
        <span className="app-logo"><BrandMark /></span>
        <h1>Sentinel <em>Motherhood</em></h1>
        <p>Guiding motherhood, nurturing generations.</p>
        <div className="app-actions">
          <Link href="/signup" className="button button-primary">Create a free account</Link>
          <Link href="/login" className="app-login">I already have an account</Link>
        </div>
      </div>

      <div className="app-tiles">
        {TILES.map((t) => (
          <Link key={t.href} href={t.href} className="app-tile">
            <span className="stage-icon">{t.icon}</span>
            <span>{t.label}</span>
          </Link>
        ))}
      </div>

      <Link href="/emergency" className="app-emergency">📍 Emergency help & nearby hospitals</Link>
    </section>
  );
}
