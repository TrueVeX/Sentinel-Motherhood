"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { logout } from "./actions/auth";
import DisplayMenu from "./DisplayMenu";
import { useI18n } from "./I18n";

type HeaderUser = { name: string; role: "mother" | "professional" | "admin" } | null;

// The logo is the link home, so "Home" doesn't need space in the bar.
// Labels are translation keys (see lib/i18n.ts).
const MAIN = [
  { href: "/pregnancy", label: "nav.pregnancy" },
  { href: "/baby-development", label: "nav.babyDevelopment" },
  { href: "/mother-care", label: "nav.motherCare" },
  { href: "/newborn-care", label: "nav.babyCare" },
  { href: "/tools", label: "nav.tools" },
  { href: "/ai-assistant", label: "nav.ai" }
];
const MORE = [
  { href: "/care", label: "nav.care" },
  { href: "/journal", label: "nav.journal" },
  { href: "/community", label: "nav.community" },
  { href: "/appointments", label: "nav.appointments" },
  { href: "/about", label: "nav.about" },
  { href: "/contact", label: "nav.contact" }
];

// The Sentinel mark: a mother cradling her baby.
export function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 48 48">
        <g transform="translate(2 0.5)">
          <circle cx="19" cy="10.5" r="5" />
          <path d="M14 18.5C9.8 21 7.5 26 7.5 32.5V42" />
          <path d="M24 18.2c2.2.6 4 1.5 5.4 2.6" />
          <circle cx="32" cy="24.5" r="3.8" />
          <path d="M28.6 26.8c-3.2-.6-7.8.4-10.8 2.8-2 1.6-1.8 3.8.6 4.4 3.6.9 8.8-.6 11.6-3.2" />
          <path d="M10.5 29.5c2.5 5.8 9 8.8 16.2 7.6 4.6-.8 8.2-3.6 9.8-7.4" />
        </g>
      </svg>
    </span>
  );
}

function useClickOutside(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) close(); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open, close]);
  return ref;
}

export default function Header({ user, unread }: { user: HeaderUser; unread: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const moreRef = useClickOutside(moreOpen, () => setMoreOpen(false));
  const searchRef = useClickOutside(searchOpen, () => setSearchOpen(false));
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Put the cursor in the search box as soon as it opens.
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);
  const accountRef = useClickOutside(accountOpen, () => setAccountOpen(false));

  // Close menus whenever the page changes.
  useEffect(() => {
    setMenuOpen(false);
    setMoreOpen(false);
    setAccountOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Sentinel Motherhood home">
        <BrandMark />
        <span className="brand-copy"><strong>SENTINEL</strong><span>MOTHERHOOD</span></span>
      </Link>

      <nav className={menuOpen ? "main-nav open" : "main-nav"} aria-label="Main">
        <div className="nav-links">
          <Link href="/" className={`nav-home ${isActive("/") ? "active" : ""}`}>{t("nav.home")}</Link>
          {MAIN.map((item) => (
            <Link key={item.href} href={item.href} className={isActive(item.href) ? "active" : ""} aria-current={isActive(item.href) ? "page" : undefined}>
              {t(item.label)}
            </Link>
          ))}
          <div className="nav-more" ref={moreRef}>
            <button type="button" onClick={() => setMoreOpen(!moreOpen)} aria-expanded={moreOpen} className={MORE.some((m) => isActive(m.href)) ? "active" : ""}>
              {t("nav.more")} <span aria-hidden="true">▾</span>
            </button>
            <div className={moreOpen ? "dropdown open" : "dropdown"}>
              {MORE.map((item) => (
                <Link key={item.href} href={item.href} className={isActive(item.href) ? "active" : ""}>{t(item.label)}</Link>
              ))}
            </div>
          </div>
        </div>

        <div className="nav-actions">
          <div className="nav-search" ref={searchRef}>
            <button type="button" className="icon-button search-toggle" onClick={() => setSearchOpen(!searchOpen)} aria-expanded={searchOpen} aria-label={t("nav.search")}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" /><path d="m20 20-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
            <form className={searchOpen ? "search-pop open" : "search-pop"} onSubmit={submitSearch} role="search">
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("nav.searchPlaceholder")} aria-label={t("nav.search")} maxLength={80} ref={searchInputRef} />
              <button type="submit">{t("nav.search")}</button>
            </form>
          </div>

          <DisplayMenu />

          <Link href="/emergency" className="nav-emergency">{t("nav.emergency")}</Link>

          {user ? (
            <>
              <Link href="/notifications" className="icon-button nav-bell" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}>
                🔔{unread > 0 && <span className="badge">{unread > 9 ? "9+" : unread}</span>}
              </Link>
              <div className="nav-account" ref={accountRef}>
                <button type="button" onClick={() => setAccountOpen(!accountOpen)} aria-expanded={accountOpen} className="avatar-button">
                  <span className="avatar">{user.name.slice(0, 1).toUpperCase()}</span>
                  <span className="account-name">{user.name.split(" ")[0]}</span>
                </button>
                <div className={accountOpen ? "dropdown right open" : "dropdown right"}>
                  <Link href="/dashboard">{t("nav.dashboard")}</Link>
                  <Link href="/profile">{t("nav.profile")}</Link>
                  <Link href="/settings">{t("nav.settings")}</Link>
                  {user.role === "admin" && <Link href="/admin">{t("nav.admin")}</Link>}
                  <form action={logout}><button type="submit">{t("nav.logout")}</button></form>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-login">{t("nav.login")}</Link>
              <Link href="/signup" className="nav-cta">{t("nav.signup")}</Link>
            </>
          )}
        </div>
      </nav>

      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation" aria-expanded={menuOpen}>
        <span /><span /><span />
      </button>
    </header>
  );
}
