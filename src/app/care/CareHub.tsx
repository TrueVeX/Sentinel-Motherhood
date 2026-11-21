"use client";

import Link from "next/link";
import { useI18n } from "../I18n";

const TRACKERS = [
  { href: "/care/kicks", icon: "👣", title: "care.kicks", help: "care.kicksHelp" },
  { href: "/care/medicines", icon: "📋", title: "care.medicines", help: "care.medicinesHelp" },
  { href: "/care/vitamins", icon: "💊", title: "care.vitamins", help: "care.vitaminsHelp" },
  { href: "/care/vaccines", icon: "💉", title: "care.vaccines", help: "care.vaccinesHelp" },
  { href: "/care/baby-log", icon: "🍼", title: "care.babyLog", help: "care.babyLogHelp" },
  { href: "/care/growth", icon: "📈", title: "care.growth", help: "care.growthHelp" },
  { href: "/care/mood", icon: "🌤", title: "care.mood", help: "care.moodHelp" }
];

export default function CareHub() {
  const { t } = useI18n();
  return (
    <>
      <section className="page-head section-wrap">
        <div className="eyebrow">{t("care.title").toUpperCase()}</div>
        <h1>{t("care.title")}</h1>
        <p>{t("care.lead")}</p>
      </section>
      <div className="section-wrap page-body">
        <div className="hub-grid">
          {TRACKERS.map((c) => (
            <Link key={c.href} href={c.href} className="hub-card">
              <span className="stage-icon">{c.icon}</span>
              <h2>{t(c.title)}</h2>
              <p>{t(c.help)}</p>
              <span className="card-arrow">{t("kit.open")} <b>→</b></span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
