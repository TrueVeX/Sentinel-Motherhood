"use client";

import Link from "next/link";
import { useI18n } from "../I18n";

/** Shared page frame for the daily care trackers (title in the chosen language). */
export default function CareShell({ titleKey, icon, children }: { titleKey: string; icon: string; children: React.ReactNode }) {
  const { t } = useI18n();
  return (
    <>
      <section className="page-head section-wrap">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/">{t("nav.home")}</Link> / <Link href="/care">{t("care.title")}</Link>
        </nav>
        <div className="eyebrow">{t("care.title").toUpperCase()}</div>
        <h1>{icon} {t(titleKey)}</h1>
        <p>{t("kit.device")}</p>
      </section>
      <div className="section-wrap page-body narrow care-body">{children}</div>
    </>
  );
}
