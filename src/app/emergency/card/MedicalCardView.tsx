"use client";

import { useEffect, useState } from "react";
import { EMPTY_CARD, loadCard, saveCard, telHref, type MedicalCard } from "@/lib/kit";
import { useI18n } from "../../I18n";

const BLOOD = ["", "A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"];
const FIELDS: { key: keyof MedicalCard; label: string; type?: string; multiline?: boolean }[] = [
  { key: "allergies", label: "card.allergies", multiline: true },
  { key: "conditions", label: "card.conditions", multiline: true },
  { key: "medicines", label: "card.medicines", multiline: true },
  { key: "dueDate", label: "card.dueDate", type: "date" },
  { key: "doctor", label: "card.doctor" },
  { key: "doctorPhone", label: "card.doctorPhone", type: "tel" },
  { key: "hospital", label: "card.hospital" },
  { key: "hospitalPhone", label: "card.hospitalPhone", type: "tel" },
  { key: "notes", label: "card.notes", multiline: true }
];

/** The medical card: a form to fill in, and a large, clear view to show to doctors or family. */
export default function MedicalCardView() {
  const { t } = useI18n();
  const [card, setCard] = useState<MedicalCard>(EMPTY_CARD);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const c = loadCard();
    setCard(c);
    setEditing(!Object.values(c).some(Boolean)); // start in the form if it's empty
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    saveCard(card);
    setSaved(true);
    setEditing(false);
  }

  function print() {
    document.body.dataset.print = "card";
    const clear = () => {
      delete document.body.dataset.print;
      window.removeEventListener("afterprint", clear);
    };
    window.addEventListener("afterprint", clear);
    window.print();
  }

  if (editing) {
    return (
      <form className="form-card wide med-form" onSubmit={submit}>
        <p>{t("card.empty")}</p>
        <label className="field">
          <span>{t("card.blood")}</span>
          <select value={card.blood} onChange={(e) => setCard({ ...card, blood: e.target.value })}>
            {BLOOD.map((b) => <option key={b} value={b}>{b || t("card.unknown")}</option>)}
          </select>
        </label>
        {FIELDS.map((f) => (
          <label key={f.key} className="field">
            <span>{t(f.label)}</span>
            {f.multiline ? (
              <textarea rows={2} maxLength={400} value={card[f.key]} onChange={(e) => setCard({ ...card, [f.key]: e.target.value })} />
            ) : (
              <input type={f.type ?? "text"} maxLength={120} value={card[f.key]} onChange={(e) => setCard({ ...card, [f.key]: e.target.value })} />
            )}
          </label>
        ))}
        <button className="button button-primary">{t("kit.save")}</button>
        <small className="kit-muted">{t("kit.device")} {t("card.offline")}</small>
      </form>
    );
  }

  const row = (label: string, value: string, tel?: boolean) => (
    <div className="med-row">
      <dt>{t(label)}</dt>
      <dd>{value ? (tel ? <a href={telHref(value)}>📞 {value}</a> : value) : <em>{t("card.unknown")}</em>}</dd>
    </div>
  );

  return (
    <div className="med-wrap">
      {saved && <p className="form-ok" role="status">{t("card.saved")} ✓</p>}
      <article className="med-card" id="med-card">
        <header>
          <span>🪪 {t("card.title")}</span>
          <strong className="med-blood">{card.blood || "?"}</strong>
        </header>
        <dl>
          {row("card.allergies", card.allergies)}
          {row("card.conditions", card.conditions)}
          {row("card.medicines", card.medicines)}
          {row("card.dueDate", card.dueDate ? new Date(`${card.dueDate}T00:00:00`).toLocaleDateString() : "")}
          {row("card.doctor", card.doctor)}
          {row("card.doctorPhone", card.doctorPhone, true)}
          {row("card.hospital", card.hospital)}
          {row("card.hospitalPhone", card.hospitalPhone, true)}
          {card.notes && row("card.notes", card.notes)}
        </dl>
      </article>
      <div className="form-buttons start">
        <button type="button" className="button button-primary" onClick={() => setEditing(true)}>✎ {t("card.edit")}</button>
        <button type="button" className="print-button" onClick={print}>🖨 {t("card.print")}</button>
      </div>
      <small className="kit-muted">{t("kit.device")} {t("card.offline")}</small>
    </div>
  );
}
