"use client";

import { useEffect, useState } from "react";
import { useI18n } from "./I18n";

export const DOWNLOAD_SITE = "https://sentinel-motherhood-download.vercel.app";

/** Button to the download website. Hidden inside the installed apps, where it isn't needed. */
export default function DownloadAppLink({ className = "download-app-link" }: { className?: string }) {
  const { t } = useI18n();
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setInstalled(
      window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true ||
        document.referrer.startsWith("android-app://") ||
        /Electron/i.test(navigator.userAgent)
    );
  }, []);

  if (installed) return null;
  return (
    <a className={className} href={DOWNLOAD_SITE} target="_blank" rel="noopener noreferrer">
      ⬇ {t("download.app")}
    </a>
  );
}
