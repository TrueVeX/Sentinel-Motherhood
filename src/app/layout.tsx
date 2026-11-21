import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import "./globals.css";
import "./pages.css";
import "./theme.css";
import { getCurrentUser } from "@/lib/auth";
import { unreadCount } from "@/lib/notify";
import Header, { BrandMark } from "./Header";
import KioskMode from "./Kiosk";
import ClickEffects from "./ClickEffects";
import AppMode from "./AppMode";
import { I18nProvider } from "./I18n";
import { LANG_COOKIE, toLang } from "@/lib/i18n";
import DownloadAppLink from "./DownloadAppLink";

export const metadata: Metadata = {
  title: "Sentinel Motherhood | Guiding motherhood, nurturing generations",
  description:
    "Trusted guidance and thoughtful support through pregnancy, postpartum recovery, newborn care and parenting.",
  authors: [{ name: "Revoori Krithika Reddy" }],
  applicationName: "Sentinel Motherhood",
  appleWebApp: { capable: true, title: "Sentinel", statusBarStyle: "default" }
};

export const viewport: Viewport = {
  themeColor: "#123F46"
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  const unread = user ? await unreadCount(user.id) : 0;
  const lang = toLang((await cookies()).get(LANG_COOKIE)?.value);

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        {/* Apply the saved text size and theme before the page paints, so there's no flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var d=document.documentElement,s=localStorage.getItem('sm-size'),t=localStorage.getItem('sm-theme');if(s)d.dataset.size=JSON.parse(s);if(t)d.dataset.theme=JSON.parse(t);}catch(e){}"
          }}
        />
      </head>
      <body>
        <I18nProvider lang={lang}>
        <ClickEffects />
        <AppMode />
        <div className="owner-bar">Made By <strong>Revoori Krithika Reddy</strong></div>
        <Header user={user ? { name: user.name, role: user.role } : null} unread={unread} />
        <main>{children}</main>
        <footer className="site-footer">
          <Link className="brand footer-brand" href="/">
            <BrandMark />
            <span className="brand-copy"><strong>SENTINEL</strong><span>MOTHERHOOD</span></span>
          </Link>
          <nav className="footer-links" aria-label="Footer">
            <Link href="/about">About Us</Link>
            <Link href="/contact">Contact Us</Link>
            <Link href="/emergency">Emergency help</Link>
            <Link href="/search">Search</Link>
          </nav>
          <DownloadAppLink />
          <KioskMode />
          <div className="footer-credits">
            <span className="footer-owner">Made By Revoori Krithika Reddy</span>
            <span className="footer-small">© {new Date().getFullYear()} Sentinel Motherhood. Built with care.</span>
          </div>
        </footer>
        </I18nProvider>
      </body>
    </html>
  );
}
