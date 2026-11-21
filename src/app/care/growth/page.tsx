"use client";

import { useEffect, useState } from "react";
import { load, save } from "@/lib/browser-storage";
import { todayKey } from "@/lib/calendar";
import { useI18n } from "../../I18n";
import CareShell from "../CareShell";

type Point = { date: string; weight: number | null; height: number | null };
const KEY = "sm-growth";

/** A small line chart of one measurement over time (plain SVG). */
function Chart({ points, unit, color }: { points: { date: string; value: number }[]; unit: string; color: string }) {
  if (points.length === 0) return null;
  const W = 560, H = 200, P = 34;
  const t0 = new Date(points[0].date).getTime();
  const t1 = Math.max(t0 + 86400000, new Date(points[points.length - 1].date).getTime());
  const vals = points.map((p) => p.value);
  const lo = Math.min(...vals), hi = Math.max(...vals);
  const pad = Math.max(0.5, (hi - lo) * 0.15);
  const y0 = lo - pad, y1 = hi + pad;
  const x = (d: string) => P + ((new Date(d).getTime() - t0) / (t1 - t0)) * (W - P * 2);
  const y = (v: number) => H - P - ((v - y0) / (y1 - y0)) * (H - P * 2);
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(p.date).toFixed(1)} ${y(p.value).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="growth-chart" role="img" aria-label={`Chart of ${unit} over time`}>
      <line x1={P} y1={H - P} x2={W - P} y2={H - P} className="axis" />
      <text x={P} y={H - 10} className="axis-label">{points[0].date}</text>
      <text x={W - P} y={H - 10} className="axis-label" textAnchor="end">{points[points.length - 1].date}</text>
      <text x={6} y={y(hi) + 4} className="axis-label">{hi}</text>
      <text x={6} y={y(lo) + 4} className="axis-label">{lo}</text>
      <path d={path} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p) => (
        <circle key={p.date} cx={x(p.date)} cy={y(p.value)} r="5" fill={color}>
          <title>{`${p.date}: ${p.value} ${unit}`}</title>
        </circle>
      ))}
    </svg>
  );
}

/** Baby's weight and length over time. */
export default function GrowthPage() {
  const { t } = useI18n();
  const [points, setPoints] = useState<Point[]>([]);
  const [form, setForm] = useState({ date: todayKey(), weight: "", height: "" });

  useEffect(() => setPoints(load<Point[]>(KEY, [])), []);

  const update = (next: Point[]) => {
    const sorted = [...next].sort((a, b) => a.date.localeCompare(b.date)).slice(-100);
    setPoints(sorted);
    save(KEY, sorted);
  };
  function add(e: React.FormEvent) {
    e.preventDefault();
    const w = parseFloat(form.weight), h = parseFloat(form.height);
    const weight = Number.isFinite(w) && w > 0 && w < 40 ? Math.round(w * 100) / 100 : null;
    const height = Number.isFinite(h) && h > 20 && h < 160 ? Math.round(h * 10) / 10 : null;
    if (!form.date || (weight === null && height === null)) return;
    update([...points.filter((p) => p.date !== form.date), { date: form.date, weight, height }]);
    setForm({ ...form, weight: "", height: "" });
  }

  const weights = points.filter((p) => p.weight !== null).map((p) => ({ date: p.date, value: p.weight! }));
  const heights = points.filter((p) => p.height !== null).map((p) => ({ date: p.date, value: p.height! }));

  return (
    <CareShell titleKey="care.growth" icon="📈">
      <form className="tracker-card growth-form" onSubmit={add}>
        <label className="field"><span>{t("growth.date")}</span><input type="date" value={form.date} max={todayKey()} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
        <label className="field"><span>{t("growth.weight")}</span><input type="number" step="0.01" min="0.3" max="40" inputMode="decimal" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} /></label>
        <label className="field"><span>{t("growth.height")}</span><input type="number" step="0.1" min="20" max="160" inputMode="decimal" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} /></label>
        <button className="button button-primary">＋ {t("growth.add")}</button>
      </form>

      {points.length === 0 ? (
        <p className="kit-muted">{t("growth.none")}</p>
      ) : (
        <>
          {weights.length > 0 && <div className="tracker-card"><h2>{t("growth.weight")}</h2><Chart points={weights} unit="kg" color="#247C78" /></div>}
          {heights.length > 0 && <div className="tracker-card"><h2>{t("growth.height")}</h2><Chart points={heights} unit="cm" color="#A4402F" /></div>}
          <div className="tracker-card">
            <ul className="tracker-list">
              {[...points].reverse().map((p) => (
                <li key={p.date}>
                  <span>{p.date}</span>
                  <strong>{p.weight !== null ? `${p.weight} kg` : ""}{p.weight !== null && p.height !== null ? " · " : ""}{p.height !== null ? `${p.height} cm` : ""}</strong>
                  <button type="button" className="kit-remove" onClick={() => update(points.filter((x) => x.date !== p.date))} aria-label={t("kit.remove")}>×</button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </CareShell>
  );
}
