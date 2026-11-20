"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Pages kiosk mode cycles through at the science fair stand.
const KIOSK_PAGES = ["/", "/pregnancy", "/baby-development", "/tools", "/emergency", "/ai-assistant", "/about"];

export default function KioskMode() {
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active) return;
    let index = Math.max(0, KIOSK_PAGES.indexOf(pathname));
    const timer = setInterval(() => {
      index = (index + 1) % KIOSK_PAGES.length;
      router.push(KIOSK_PAGES[index]);
      window.scrollTo({ top: 0 });
    }, 9000);
    // Also scroll slowly down each page so visitors see more of it.
    const scroller = setInterval(() => window.scrollBy({ top: 2, behavior: "auto" }), 40);
    const stop = () => setActive(false);
    const arm = setTimeout(() => {
      window.addEventListener("keydown", stop);
      window.addEventListener("pointerdown", stop);
    }, 300);
    const onFullscreen = () => { if (!document.fullscreenElement) stop(); };
    document.addEventListener("fullscreenchange", onFullscreen);
    return () => {
      clearInterval(timer);
      clearInterval(scroller);
      clearTimeout(arm);
      window.removeEventListener("keydown", stop);
      window.removeEventListener("pointerdown", stop);
      document.removeEventListener("fullscreenchange", onFullscreen);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined);
    };
    // pathname is only read once when kiosk mode starts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, router]);

  function start() {
    document.documentElement.requestFullscreen?.().catch(() => undefined);
    setActive(true);
  }

  return active ? (
    <div className="kiosk-banner" role="status">Kiosk mode · touch the screen or press any key to exit</div>
  ) : (
    <button type="button" className="kiosk-button" onClick={start}>▶ Kiosk mode</button>
  );
}
