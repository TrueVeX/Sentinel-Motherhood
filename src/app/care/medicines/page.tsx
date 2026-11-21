"use client";

import { useEffect, useState } from "react";
import { load, save } from "@/lib/browser-storage";
import { downloadIcs, googleCalendarUrl, todayKey } from "@/lib/calendar";
import { MEDICINE_GUIDE, findMedicine, type MedicineInfo } from "@/lib/medicines";
import { deletePhoto, getPhoto, putPhoto, shrinkImage } from "@/lib/photo-store";
import { isActive, loadPrescriptions, savePrescriptions, type Prescription, type Who } from "@/lib/prescriptions";
import { useI18n } from "../../I18n";
import CareShell from "../CareShell";

const FREQUENCIES = ["rx.freq.once", "rx.freq.twice", "rx.freq.thrice", "rx.freq.weekly", "rx.freq.needed", "rx.freq.other"];
const BLANK = { who: "mother" as Who, name: "", dose: "", frequency: "rx.freq.once", time: "09:00", start: "", end: "", prescribedBy: "", reason: "", notes: "" };

function GuideEntry({ m, open = false }: { m: MedicineInfo; open?: boolean }) {
  const { t } = useI18n();
  return (
    <details className="guide-entry" open={open}>
      <summary>
        <strong>{m.name}</strong>
        <span className={`who-tag ${m.for}`}>{m.for === "both" ? `${t("rx.mother")} + ${t("rx.baby")}` : t(m.for === "baby" ? "rx.baby" : "rx.mother")}</span>
        <small>{m.group}</small>
      </summary>
      <p><b>{t("rx.usedFor")}:</b> {m.usedFor}</p>
      <p className="guide-note">⚠ {m.notes}</p>
    </details>
  );
}

const askAiHref = (name: string, who: Who) =>
  `/ai-assistant?q=${encodeURIComponent(`What is ${name} commonly used for ${who === "baby" ? "in babies and children" : "in pregnancy or after birth"}? General information only.`)}`;

/** Prescriptions for mother and baby, and a guide to what common medicines are used for. */
export default function MedicinesPage() {
  const { t } = useI18n();
  const [list, setList] = useState<Prescription[]>([]);
  const [taken, setTaken] = useState<Record<string, string[]>>({});
  const [filter, setFilter] = useState<"all" | Who>("all");
  const [form, setForm] = useState<typeof BLANK | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [viewPhoto, setViewPhoto] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [guideWho, setGuideWho] = useState<"all" | Who>("all");
  const [error, setError] = useState("");

  useEffect(() => {
    setList(loadPrescriptions());
    setTaken(load<Record<string, string[]>>("sm-rx-taken", {}));
  }, []);

  const today = todayKey();
  const update = (next: Prescription[]) => { setList(next); savePrescriptions(next); };

  function startAdd() {
    setForm({ ...BLANK, who: filter === "baby" ? "baby" : "mother", start: today });
    setEditId(null);
    setPhoto(null);
    setError("");
  }
  async function startEdit(p: Prescription) {
    setForm({ who: p.who, name: p.name, dose: p.dose, frequency: p.frequency, time: p.time, start: p.start, end: p.end, prescribedBy: p.prescribedBy, reason: p.reason, notes: p.notes });
    setEditId(p.id);
    setPhoto(p.hasPhoto ? (await getPhoto(p.id)) ?? null : null);
    setError("");
  }
  async function onPhoto(file: File | undefined) {
    if (!file) return;
    try {
      setPhoto(await shrinkImage(file));
    } catch {
      setError(t("rx.photoError"));
    }
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form || form.name.trim().length < 2) return;
    const id = editId ?? crypto.randomUUID();
    const clean = {
      ...form,
      name: form.name.trim().slice(0, 60),
      dose: form.dose.trim().slice(0, 60),
      prescribedBy: form.prescribedBy.trim().slice(0, 60),
      reason: form.reason.trim().slice(0, 200),
      notes: form.notes.trim().slice(0, 300)
    };
    try {
      if (photo) await putPhoto(id, photo);
      else await deletePhoto(id);
    } catch {
      setError(t("rx.photoError"));
    }
    const item: Prescription = { id, ...clean, hasPhoto: !!photo };
    update(editId ? list.map((p) => (p.id === editId ? item : p)) : [...list, item]);
    setForm(null);
    setEditId(null);
    setPhoto(null);
  }
  function remove(p: Prescription) {
    if (!window.confirm(`${t("kit.remove")}: ${p.name}?`)) return;
    deletePhoto(p.id);
    update(list.filter((x) => x.id !== p.id));
  }
  function toggleTaken(id: string) {
    const day = taken[today] ?? [];
    const next = { ...taken, [today]: day.includes(id) ? day.filter((x) => x !== id) : [...day, id] };
    const keys = Object.keys(next).sort().slice(-60);
    const trimmed = Object.fromEntries(keys.map((k) => [k, next[k]]));
    setTaken(trimmed);
    save("sm-rx-taken", trimmed);
  }
  async function showPhoto(id: string) {
    setViewPhoto((await getPhoto(id)) ?? null);
  }
  const reminderStart = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    const d = new Date();
    d.setHours(h || 9, m || 0, 0, 0);
    return d;
  };

  const shown = list.filter((p) => filter === "all" || p.who === filter);
  const active = shown.filter((p) => isActive(p, today));
  const finished = shown.filter((p) => !isActive(p, today));
  const match = form ? findMedicine(form.name) : null;
  const q = query.trim().toLowerCase();
  const guide = MEDICINE_GUIDE.filter(
    (m) =>
      (guideWho === "all" || m.for === guideWho || m.for === "both") &&
      (!q || [m.name, ...(m.aka ?? []), m.usedFor].join(" ").toLowerCase().includes(q))
  );

  const card = (p: Prescription) => {
    const info = findMedicine(p.name);
    const done = (taken[today] ?? []).includes(p.id);
    const daily = ["rx.freq.once", "rx.freq.twice", "rx.freq.thrice"].includes(p.frequency);
    return (
      <li key={p.id} className={`rx-card ${p.who}`}>
        <div className="rx-head">
          <span className={`who-tag ${p.who}`}>{p.who === "baby" ? `👶 ${t("rx.baby")}` : `🤰 ${t("rx.mother")}`}</span>
          <h3>{p.name}</h3>
          {p.hasPhoto && <button type="button" className="link-button" onClick={() => showPhoto(p.id)}>📷 {t("rx.viewPhoto")}</button>}
        </div>
        <p className="rx-line">{[p.dose, t(p.frequency), p.time && daily ? `⏰ ${p.time}` : ""].filter(Boolean).join(" · ")}</p>
        {p.reason && <p className="rx-reason"><b>{t("rx.why")}:</b> {p.reason}</p>}
        <p className="rx-meta">
          {[p.prescribedBy && `${t("rx.by")} ${p.prescribedBy}`, p.start && `${t("rx.from")} ${p.start}`, p.end && `${t("rx.until")} ${p.end}`].filter(Boolean).join(" · ")}
        </p>
        {info && (
          <details className="rx-info">
            <summary>💡 {t("rx.usedFor")}: {info.name}</summary>
            <p>{info.usedFor}</p>
            <p className="guide-note">⚠ {info.notes}</p>
          </details>
        )}
        <div className="rx-actions">
          {isActive(p, today) && daily && (
            <label className="vit-check rx-taken">
              <input type="checkbox" checked={done} onChange={() => toggleTaken(p.id)} />
              <span><strong>{t("vit.taken")}</strong></span>
            </label>
          )}
          {isActive(p, today) && daily && (
            <>
              <a href={googleCalendarUrl({ title: `💊 ${p.name}${p.who === "baby" ? " (baby)" : ""}`, details: [p.dose, p.reason].filter(Boolean).join(" · "), start: reminderStart(p.time), daily: true })} target="_blank" rel="noopener noreferrer">📅 Google</a>
              <button type="button" className="link-button" onClick={() => downloadIcs(`${p.name}-reminder.ics`, [{ title: `💊 ${p.name}`, details: [p.dose, p.reason].filter(Boolean).join(" · "), start: reminderStart(p.time), daily: true }])}>📅 .ics</button>
            </>
          )}
          <a href={askAiHref(p.name, p.who)}>🤖 {t("rx.askAi")}</a>
          <button type="button" className="link-button" onClick={() => startEdit(p)}>✎ {t("card.edit")}</button>
          <button type="button" className="kit-remove" onClick={() => remove(p)} aria-label={`${t("kit.remove")} ${p.name}`}>×</button>
        </div>
      </li>
    );
  };

  return (
    <CareShell titleKey="care.medicines" icon="📋">
      <p className="tracker-warning">⚠ {t("rx.disclaimer")}</p>

      <div className="tracker-card">
        <div className="rx-toolbar">
          <div className="segmented" role="radiogroup" aria-label={t("rx.forWhom")}>
            {(["all", "mother", "baby"] as const).map((w) => (
              <button type="button" key={w} role="radio" aria-checked={filter === w} className={filter === w ? "active" : ""} onClick={() => setFilter(w)}>
                {w === "all" ? t("rx.all") : w === "baby" ? `👶 ${t("rx.baby")}` : `🤰 ${t("rx.mother")}`}
              </button>
            ))}
          </div>
          {!form && <button type="button" className="button button-primary" onClick={startAdd}>＋ {t("rx.add")}</button>}
        </div>

        {form && (
          <form className="rx-form" onSubmit={submit}>
            <div className="segmented" role="radiogroup" aria-label={t("rx.forWhom")}>
              {(["mother", "baby"] as const).map((w) => (
                <button type="button" key={w} role="radio" aria-checked={form.who === w} className={form.who === w ? "active" : ""} onClick={() => setForm({ ...form, who: w })}>
                  {w === "baby" ? `👶 ${t("rx.baby")}` : `🤰 ${t("rx.mother")}`}
                </button>
              ))}
            </div>
            <label className="field">
              <span>{t("rx.name")}</span>
              <input list="medicine-names" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={60} placeholder="e.g. Folic acid" />
              <datalist id="medicine-names">{MEDICINE_GUIDE.map((m) => <option key={m.name} value={m.name} />)}</datalist>
            </label>
            {match && (
              <div className="rx-match">
                <p><b>💡 {t("rx.usedFor")} ({match.name}):</b> {match.usedFor}</p>
                <p className="guide-note">⚠ {match.notes}</p>
              </div>
            )}
            <div className="field-row">
              <label className="field"><span>{t("rx.dose")}</span><input value={form.dose} onChange={(e) => setForm({ ...form, dose: e.target.value })} maxLength={60} placeholder="e.g. 1 tablet / 5 ml" /></label>
              <label className="field">
                <span>{t("rx.frequency")}</span>
                <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}>
                  {FREQUENCIES.map((f) => <option key={f} value={f}>{t(f)}</option>)}
                </select>
              </label>
            </div>
            <div className="field-row">
              <label className="field"><span>{t("rx.start")}</span><input type="date" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} /></label>
              <label className="field"><span>{t("rx.end")}</span><input type="date" value={form.end} min={form.start || undefined} onChange={(e) => setForm({ ...form, end: e.target.value })} /></label>
            </div>
            <div className="field-row">
              <label className="field"><span>{t("vit.time")}</span><input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></label>
              <label className="field"><span>{t("rx.prescribedBy")}</span><input value={form.prescribedBy} onChange={(e) => setForm({ ...form, prescribedBy: e.target.value })} maxLength={60} placeholder="Dr. …" /></label>
            </div>
            <label className="field"><span>{t("rx.reason")}</span><input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} maxLength={200} placeholder={t("rx.reasonHint")} /></label>
            <label className="field"><span>{t("card.notes")}</span><textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} maxLength={300} /></label>
            <div className="rx-photo">
              <label className="kit-add">
                📷 {photo ? t("rx.changePhoto") : t("rx.addPhoto")}
                <input type="file" accept="image/*" capture="environment" hidden onChange={(e) => onPhoto(e.target.files?.[0])} />
              </label>
              {photo && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo} alt={t("rx.viewPhoto")} />
                  <button type="button" className="link-button" onClick={() => setPhoto(null)}>{t("kit.remove")}</button>
                </>
              )}
            </div>
            {error && <p className="form-error">{error}</p>}
            <div className="kit-form-buttons">
              <button type="submit" className="button button-primary">{t("kit.save")}</button>
              <button type="button" className="text-link" onClick={() => setForm(null)}>{t("kit.cancel")}</button>
            </div>
          </form>
        )}

        {!form && shown.length === 0 && <p className="kit-muted">{t("rx.empty")}</p>}
        {active.length > 0 && <ul className="rx-list">{active.map(card)}</ul>}
        {finished.length > 0 && (
          <details className="rx-finished">
            <summary>{t("rx.finished")} ({finished.length})</summary>
            <ul className="rx-list">{finished.map(card)}</ul>
          </details>
        )}
      </div>

      <div className="tracker-card">
        <h2>📖 {t("rx.guide")}</h2>
        <p className="kit-muted">{t("rx.guideLead")}</p>
        <div className="rx-toolbar">
          <input className="names-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("rx.searchGuide")} aria-label={t("rx.searchGuide")} />
          <div className="segmented" role="radiogroup" aria-label={t("rx.forWhom")}>
            {(["all", "mother", "baby"] as const).map((w) => (
              <button type="button" key={w} role="radio" aria-checked={guideWho === w} className={guideWho === w ? "active" : ""} onClick={() => setGuideWho(w)}>
                {w === "all" ? t("rx.all") : w === "baby" ? `👶 ${t("rx.baby")}` : `🤰 ${t("rx.mother")}`}
              </button>
            ))}
          </div>
        </div>
        <div className="guide-list">
          {guide.map((m) => <GuideEntry key={m.name} m={m} open={!!q && guide.length <= 2} />)}
          {guide.length === 0 && (
            <p className="kit-muted">
              {t("rx.notInGuide")} <a href={askAiHref(query, guideWho === "baby" ? "baby" : "mother")}>🤖 {t("rx.askAi")}</a>
            </p>
          )}
        </div>
      </div>

      {viewPhoto && (
        <div className="photo-view" role="dialog" aria-label={t("rx.viewPhoto")} onClick={() => setViewPhoto(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={viewPhoto} alt={t("rx.viewPhoto")} />
          <button type="button" className="dialog-close" aria-label="Close">×</button>
        </div>
      )}
    </CareShell>
  );
}
