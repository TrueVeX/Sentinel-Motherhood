"use client";

import { useEffect, useMemo, useState } from "react";
import { checklistGroups, warningSigns } from "./data";

const DAY = 24 * 60 * 60 * 1000;
const PREGNANCY_DAYS = 280;

function load<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: keep in memory only */
  }
}

function parseDate(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return y && m && d ? new Date(y, m - 1, d) : null;
}

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
}

const trimesterNotes = [
  "First trimester: a time of rapid early development. Rest when you can and book your first antenatal appointment.",
  "Second trimester: many people feel more energy now. You may start to feel your baby move.",
  "Third trimester: your baby is growing and getting ready. Time to prepare your hospital bag and birth plan."
];

export function DueDateTracker() {
  const [mode, setMode] = useState<"lmp" | "due">("lmp");
  const [value, setValue] = useState("");

  useEffect(() => {
    const stored = load<{ mode: "lmp" | "due"; value: string } | null>("sm-tracker", null);
    if (stored) {
      setMode(stored.mode);
      setValue(stored.value);
    }
  }, []);

  useEffect(() => {
    if (value) save("sm-tracker", { mode, value });
  }, [mode, value]);

  const result = useMemo(() => {
    const date = parseDate(value);
    if (!date) return null;
    const lmp = mode === "lmp" ? date : new Date(date.getTime() - PREGNANCY_DAYS * DAY);
    const due = new Date(lmp.getTime() + PREGNANCY_DAYS * DAY);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const elapsed = Math.round((today.getTime() - lmp.getTime()) / DAY);
    if (elapsed < 0) return { error: "That date is in the future. Please check the date you entered." };
    if (elapsed > 44 * 7) return { error: "That date is more than 44 weeks ago. Please check the date you entered." };
    const weeks = Math.floor(elapsed / 7);
    const days = elapsed % 7;
    const trimester = weeks < 14 ? 1 : weeks < 28 ? 2 : 3;
    const daysLeft = Math.max(0, PREGNANCY_DAYS - elapsed);
    const progress = Math.min(100, Math.round((elapsed / PREGNANCY_DAYS) * 100));
    return { due, weeks, days, trimester, daysLeft, progress };
  }, [mode, value]);

  return (
    <div className="tool-card">
      <div className="tool-head">
        <span className="stage-icon">◷</span>
        <div>
          <h3>Pregnancy week tracker</h3>
          <p>Estimate your due date and see how far along you are.</p>
        </div>
      </div>

      <div className="segmented" role="radiogroup" aria-label="Date type">
        <button type="button" role="radio" aria-checked={mode === "lmp"} className={mode === "lmp" ? "active" : ""} onClick={() => setMode("lmp")}>
          First day of last period
        </button>
        <button type="button" role="radio" aria-checked={mode === "due"} className={mode === "due" ? "active" : ""} onClick={() => setMode("due")}>
          I know my due date
        </button>
      </div>

      <label className="field">
        <span>{mode === "lmp" ? "First day of your last period" : "Your due date"}</span>
        <input type="date" value={value} onChange={(e) => setValue(e.target.value)} />
      </label>

      {result && "error" in result && <p className="tool-error" role="alert">{result.error}</p>}

      {result && !("error" in result) && (
        <div className="tracker-result" aria-live="polite">
          <div className="tracker-stats">
            <div><strong>{result.weeks}w {result.days}d</strong><small>How far along</small></div>
            <div><strong>{result.trimester === 1 ? "1st" : result.trimester === 2 ? "2nd" : "3rd"}</strong><small>Trimester</small></div>
            <div><strong>{result.daysLeft}</strong><small>Days to go</small></div>
          </div>
          <div className="progress" aria-label={`${result.progress}% of the way to your due date`}>
            <span style={{ width: `${result.progress}%` }} />
          </div>
          <p className="tracker-due">Estimated due date: <b>{formatDate(result.due)}</b></p>
          <p className="tracker-note">{trimesterNotes[result.trimester - 1]}</p>
        </div>
      )}
      <small className="tool-disclaimer">This is an estimate only. Your care team will confirm your due date, usually with an ultrasound scan.</small>
    </div>
  );
}

export function HospitalChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [custom, setCustom] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setChecked(load("sm-checklist", {}));
    setCustom(load("sm-checklist-custom", []));
  }, []);

  const groups = [...checklistGroups, ...(custom.length ? [{ title: "My items", items: custom }] : [])];
  const allItems = groups.flatMap((g) => g.items.map((item) => `${g.title}:${item}`));
  const done = allItems.filter((key) => checked[key]).length;
  const percent = allItems.length ? Math.round((done / allItems.length) * 100) : 0;

  function toggle(key: string) {
    const next = { ...checked, [key]: !checked[key] };
    setChecked(next);
    save("sm-checklist", next);
  }

  function addItem(event: React.FormEvent) {
    event.preventDefault();
    const item = draft.trim();
    if (!item || custom.includes(item)) return;
    const next = [...custom, item];
    setCustom(next);
    save("sm-checklist-custom", next);
    setDraft("");
  }

  function removeItem(item: string) {
    const next = custom.filter((i) => i !== item);
    setCustom(next);
    save("sm-checklist-custom", next);
  }

  function reset() {
    setChecked({});
    save("sm-checklist", {});
  }

  return (
    <div className="tool-card">
      <div className="tool-head">
        <span className="stage-icon">✓</span>
        <div>
          <h3>Hospital bag checklist</h3>
          <p>Tick things off as you pack. Your progress is saved on this device.</p>
        </div>
      </div>

      <div className="checklist-progress">
        <span>{done} of {allItems.length} packed</span>
        <button type="button" className="link-button" onClick={reset} disabled={done === 0}>Reset</button>
      </div>
      <div className="progress"><span style={{ width: `${percent}%` }} /></div>

      <div className="checklist-groups">
        {groups.map((group) => (
          <fieldset key={group.title}>
            <legend>{group.title}</legend>
            {group.items.map((item) => {
              const key = `${group.title}:${item}`;
              return (
                <label className={checked[key] ? "check done" : "check"} key={key}>
                  <input type="checkbox" checked={!!checked[key]} onChange={() => toggle(key)} />
                  <span>{item}</span>
                  {group.title === "My items" && (
                    <button type="button" className="remove" aria-label={`Remove ${item}`} onClick={(e) => { e.preventDefault(); removeItem(item); }}>×</button>
                  )}
                </label>
              );
            })}
          </fieldset>
        ))}
      </div>

      <form className="add-item" onSubmit={addItem}>
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add your own item" aria-label="Add your own checklist item" maxLength={60} />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}

export function PrintButton({ label = "🖨 Print" }: { label?: string }) {
  function print() {
    document.body.dataset.print = "tools";
    const clear = () => {
      delete document.body.dataset.print;
      window.removeEventListener("afterprint", clear);
    };
    window.addEventListener("afterprint", clear);
    window.print();
  }
  return <button type="button" className="print-button" onClick={print}>{label}</button>;
}

export function WarningSigns() {
  return (
    <section className="warning-section" id="help" aria-labelledby="warning-title">
      <div className="warning-card">
        <div className="warning-copy">
          <div className="eyebrow warning-eyebrow">WHEN TO SEEK HELP</div>
          <h2 id="warning-title">Trust your instincts.</h2>
          <p>
            If something doesn’t feel right, contact your midwife, doctor or maternity unit straight away.
            In an emergency, call your local emergency number.
          </p>
          <a className="find-hospital" href="#hospitals">📍 Find nearby hospitals ↓</a>
        </div>
        <ul className="warning-list">
          {warningSigns.map((sign) => (
            <li key={sign}><span aria-hidden="true">!</span>{sign}</li>
          ))}
        </ul>
      </div>
      <small className="warning-foot">This list is not complete. If you are worried about any symptom, get medical advice.</small>
    </section>
  );
}
