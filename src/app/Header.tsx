"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { logout } from "./actions/auth";

type HeaderUser = { name: string; role: "mother" | "professional" | "admin" } | null;

// The logo is the link home, so "Home" doesn't need space in the bar.
const MAIN = [
  { href: "/pregnancy", label: "Pregnancy" },
  { href: "/baby-development", label: "Baby Development" },
  { href: "/mother-care", label: "Mother Care" },
  { href: "/newborn-care", label: "Baby Care" },
  { href: "/tools", label: "Tools" },
  { href: "/ai-assistant", label: "AI Assistant" }
];
const MORE = [
  { href: "/journal", label: "Journal" },
  { href: "/community", label: "Community" },
  { href: "/appointments", label: "Appointments" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" }
];

export function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 48 48">
        <path d="M24 4.5 40 10v11.2c0 10.1-6.6 17.7-16 22.3C14.6 38.9 8 31.3 8 21.2V10L24 4.5Z" />
        <path d="M17.1 20.8c0-3.2 2.2-5.4 5-5.4 1.1 0 2.2.5 2.9 1.4.8-.9 1.9-1.4 3-1.4 2.7 0 4.9 2.2 4.9 5.4 0 4.2-5.2 8-7.9 10-2.7-2-7.9-5.8-7.9-10Z" />
        <path d="M14.5 34.2c2.8-2.8 5.9-4.2 9.5-4.2s6.7 1.4 9.5 4.2" />
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
          <Link href="/" className={`nav-home ${isActive("/") ? "active" : ""}`}>Home</Link>
          {MAIN.map((item) => (
            <Link key={item.href} href={item.href} className={isActive(item.href) ? "active" : ""} aria-current={isActive(item.href) ? "page" : undefined}>
              {item.label}
            </Link>
          ))}
          <div className="nav-more" ref={moreRef}>
            <button type="button" onClick={() => setMoreOpen(!moreOpen)} aria-expanded={moreOpen} className={MORE.some((m) => isActive(m.href)) ? "active" : ""}>
              More <span aria-hidden="true">▾</span>
            </button>
            <div className={moreOpen ? "dropdown open" : "dropdown"}>
              {MORE.map((item) => (
                <Link key={item.href} href={item.href} className={isActive(item.href) ? "active" : ""}>{item.label}</Link>
              ))}
            </div>
          </div>
        </div>

        <div className="nav-actions">
          <div className="nav-search" ref={searchRef}>
            <button type="button" className="icon-button search-toggle" onClick={() => setSearchOpen(!searchOpen)} aria-expanded={searchOpen} aria-label="Search the site">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" /><path d="m20 20-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
            <form className={searchOpen ? "search-pop open" : "search-pop"} onSubmit={submitSearch} role="search">
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search Sentinel…" aria-label="Search the site" maxLength={80} ref={searchInputRef} />
              <button type="submit">Search</button>
            </form>
          </div>

          <Link href="/emergency" className="nav-emergency">Emergency</Link>

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
                  <Link href="/dashboard">My dashboard</Link>
                  <Link href="/profile">Profile</Link>
                  <Link href="/settings">Settings</Link>
                  {user.role === "admin" && <Link href="/admin">Admin</Link>}
                  <form action={logout}><button type="submit">Log out</button></form>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-login">Log in</Link>
              <Link href="/signup" className="nav-cta">Sign up</Link>
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
