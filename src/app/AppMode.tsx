"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Installed-app behaviour:
 * - registers the small offline service worker (on the live site only);
 * - inside the installed app, the homepage is the simple start screen, not the cinematic one.
 */
export default function AppMode() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  useEffect(() => {
    const installed =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iPhone "Add to Home Screen"
      (navigator as Navigator & { standalone?: boolean }).standalone === true ||
      // Android app (Trusted Web Activity) opens with this referrer
      document.referrer.startsWith("android-app://");
    if (installed && pathname === "/") router.replace("/app");
  }, [pathname, router]);

  return null;
}
