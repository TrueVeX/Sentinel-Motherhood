"use client";

import { useEffect, useState } from "react";
import { load, save } from "@/lib/browser-storage";
import { downloadIcs, googleCalendarUrl, todayKey } from "@/lib/calendar";
import { useI18n } from "../../I18n";
import CareShell from "../CareShell";

type Item = { id: string; name: string; time: string };
const SUGGESTIONS = ["Folic acid", "Iron", "Calcium", "Vitamin D"];

const dayKey = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** Daily vitamins and medicines: tick off each dose, see streaks, and add a daily calendar reminder. */
export default function VitaminsPage() {
  const { t } = useI18n();
  const [items, setItems] = useState<Item[]>([]);
  const [taken, setTaken] = useState<Record<string, string[]>>({});
  const [name, setName] = useState("");
  const [time, setTime] = useState("09:00");

  useEffect(() => {
    setItems(load<Item[]>("sm-vitamins", []));
    setTaken(load<Record<string, string[]>>("sm-vitamins-taken", {}));
  }, []);

  const saveItems = (next: Item[]) => { setItems(next); save("sm-vitamins", next); };
  const add = (n: string) => {
    const clean = n.trim().slice(0, 40);
    if (!clean || items.some((i) => i.name.toLowerCase() === clean.toLowerCase())) return;
    saveItems([...items, { id: crypto.randomUUID(), name: clean, time }]);
    setName("");
  };
  const toggle = (id: string) => {
    const today = todayKey();
    const day = taken[today] ?? [];
    const next = { ...taken, [today]: day.includes(id) ? day.filter((x) => x !== id) : [...day, id] };
    // Keep the last 60 days only.
    const keys = Object.keys(next).sort().slice(-60);
    const trimmed = Object.fromEntries(keys.map((k) => [k, next[k]]));
    setTaken(trimmed);
    save("sm-vitamins-taken", trimmed);
  };
  const streak = (id: string) => {
    let n = 0;
    for (let i = (taken[todayKey()] ?? []).includes(id) ? 0 : 1; i < 60; i++) {
      if ((taken[dayKey(i)] ?? []).includes(id)) n++;
      else break;
    }
    return n;
  };
  const reminderStart = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    const d = new Date();
    d.setHours(h || 9, m || 0, 0, 0);
    return d;
  };

  return (
    <CareShell titleKey="care.vitamins" icon="💊">
      <div className="tracker-card">
        {items.length === 0 && <p className="kit-muted">{t("vit.note")}</p>}
        <ul className="vit-list">
          {items.map((i) => {
            const done = (taken[todayKey()] ?? []).includes(i.id);
            const s = streak(i.id);
            return (
              <li key={i.id} className={done ? "done" : ""}>
                <label className="vit-check">
                  <input type="checkbox" checked={done} onChange={() => toggle(i.id)} />
                  <span>
                    <strong>{i.name}</strong>
                    <small>⏰ {i.time}{s > 1 ? ` · 🔥 ${s} ${t("vit.streak")}` : ""}</small>
                  </span>
                </label>
                <span className="vit-actions">
                  <a href={googleCalendarUrl({ title: `💊 ${i.name}`, details: "Sentinel Motherhood reminder", start: reminderStart(i.time), daily: true })} target="_blank" rel="noopener noreferrer" title={t("vit.remind")}>📅 Google</a>
                  <button type="button" className="link-button" onClick={() => downloadIcs(`${i.name}-reminder.ics`, [{ title: `💊 ${i.name}`, details: "Sentinel Motherhood reminder", start: reminderStart(i.time), daily: true }])}>📅 .ics</button>
                  <button type="button" className="kit-remove" onClick={() => saveItems(items.filter((x) => x.id !== i.id))} aria-label={`${t("kit.remove")} ${i.name}`}>×</button>
                </span>
              </li>
            );
          })}
        </ul>
        <form className="vit-add" onSubmit={(e) => { e.preventDefault(); add(name); }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("vit.add")} aria-label={t("vit.add")} maxLength={40} />
          <label className="vit-time"><span>{t("vit.time")}</span><input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></label>
          <button className="button button-primary">＋</button>
        </form>
        <div className="chip-row">
          {SUGGESTIONS.filter((s) => !items.some((i) => i.name === s)).map((s) => (
            <button type="button" key={s} onClick={() => add(s)}>＋ {s}</button>
          ))}
        </div>
        <small className="kit-muted">📅 {t("vit.remind")} · {t("vit.note")}</small>
      </div>
    </CareShell>
  );
}
