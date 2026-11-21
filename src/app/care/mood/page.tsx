"use client";

import { useEffect, useState } from "react";
import { load, save } from "@/lib/browser-storage";
import { todayKey } from "@/lib/calendar";
import { savedCountry } from "@/lib/kit";
import { useI18n } from "../../I18n";
import CareShell from "../CareShell";

const MOODS = [
  { score: 5, face: "😄", label: "mood.great" },
  { score: 4, face: "🙂", label: "mood.good" },
  { score: 3, face: "😐", label: "mood.okay" },
  { score: 2, face: "😔", label: "mood.low" },
  { score: 1, face: "😢", label: "mood.veryLow" }
];
const KEY = "sm-mood";

const dayKey = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** A daily mood check-in with a 14-day chart. Several low days in a week gently suggest support. */
export default function MoodPage() {
  const { t } = useI18n();
  const [moods, setMoods] = useState<Record<string, number>>({});
  const [country, setCountry] = useState<string | null>(null);

  useEffect(() => {
    setMoods(load<Record<string, number>>(KEY, {}));
    setCountry(savedCountry());
  }, []);

  const choose = (score: number) => {
    const next = { ...moods, [todayKey()]: score };
    const keys = Object.keys(next).sort().slice(-120);
    const trimmed = Object.fromEntries(keys.map((k) => [k, next[k]]));
    setMoods(trimmed);
    save(KEY, trimmed);
  };

  const days = Array.from({ length: 14 }, (_, i) => dayKey(13 - i));
  const lowDays = days.slice(-7).filter((d) => (moods[d] ?? 5) <= 2).length;
  const today = moods[todayKey()];

  return (
    <CareShell titleKey="care.mood" icon="🌤">
      <div className="tracker-card">
        <h2>{t("mood.question")}</h2>
        <div className="mood-pick" role="radiogroup" aria-label={t("mood.question")}>
          {MOODS.map((m) => (
            <button type="button" key={m.score} role="radio" aria-checked={today === m.score} className={today === m.score ? "active" : ""} onClick={() => choose(m.score)}>
              <span>{m.face}</span>
              {t(m.label)}
            </button>
          ))}
        </div>
      </div>

      <div className="tracker-card">
        <h2>{t("mood.history")}</h2>
        <div className="mood-bars" aria-label={t("mood.history")}>
          {days.map((d) => {
            const s = moods[d];
            return (
              <div key={d} className="mood-bar" title={`${d}: ${s ?? "–"}`}>
                <span style={{ height: s ? `${s * 20}%` : "4%" }} className={s ? (s <= 2 ? "low" : s === 3 ? "mid" : "high") : "none"} />
                <small>{new Date(`${d}T00:00:00`).getDate()}</small>
              </div>
            );
          })}
        </div>
      </div>

      {lowDays >= 3 && (
        <div className="tracker-card mood-support" role="status">
          <p>💛 {t("mood.support")}</p>
          {country === "IN" && (
            <>
              <p>{t("mood.helpline")}</p>
              <a className="call-button big" href="tel:14416">📞 {t("mood.callHelpline")}</a>
            </>
          )}
        </div>
      )}
    </CareShell>
  );
}
