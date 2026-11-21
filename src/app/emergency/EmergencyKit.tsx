"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadContacts, saveContacts, telHref, type Contact } from "@/lib/kit";
import { useI18n } from "../I18n";
import SosShare from "./SosShare";

/** The emergency kit on the Emergency page: SOS, contacts, and links to the medical card and labour mode. */
export default function EmergencyKit() {
  const { t } = useI18n();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", relation: "" });

  useEffect(() => setContacts(loadContacts()), []);

  function update(next: Contact[]) {
    setContacts(next);
    saveContacts(next);
  }

  function add(e: React.FormEvent) {
    e.preventDefault();
    const name = form.name.trim().slice(0, 40);
    const phone = form.phone.trim().slice(0, 20);
    if (!name || phone.replace(/\D/g, "").length < 3) return;
    update([...contacts, { id: crypto.randomUUID(), name, phone, relation: form.relation.trim().slice(0, 30) }]);
    setForm({ name: "", phone: "", relation: "" });
    setAdding(false);
  }

  return (
    <section className="kit section-wrap" id="kit" aria-labelledby="kit-title">
      <div className="section-heading">
        <div>
          <div className="eyebrow">SOS</div>
          <h2 id="kit-title">{t("kit.title")}</h2>
        </div>
        <p>{t("kit.lead")}</p>
      </div>

      <div className="kit-grid">
        <div className="kit-card kit-sos">
          <SosShare />
        </div>

        <div className="kit-card">
          <h3>📇 {t("kit.contacts")}</h3>
          {contacts.length === 0 && !adding && <p className="kit-muted">{t("kit.noContacts")}</p>}
          <ul className="kit-contacts">
            {contacts.map((c) => (
              <li key={c.id}>
                <span>
                  <strong>{c.name}</strong>
                  <small>{[c.relation, c.phone].filter(Boolean).join(" · ")}</small>
                </span>
                <a className="call-button" href={telHref(c.phone)}>📞 {t("kit.call")}</a>
                <button type="button" className="kit-remove" onClick={() => update(contacts.filter((x) => x.id !== c.id))} aria-label={`${t("kit.remove")} ${c.name}`}>×</button>
              </li>
            ))}
          </ul>
          {adding ? (
            <form className="kit-form" onSubmit={add}>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t("kit.name")} aria-label={t("kit.name")} required maxLength={40} />
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder={t("kit.phone")} aria-label={t("kit.phone")} required type="tel" inputMode="tel" maxLength={20} />
              <input value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value })} placeholder={t("kit.relation")} aria-label={t("kit.relation")} maxLength={30} />
              <div className="kit-form-buttons">
                <button type="submit" className="button button-primary">{t("kit.save")}</button>
                <button type="button" className="text-link" onClick={() => setAdding(false)}>{t("kit.cancel")}</button>
              </div>
            </form>
          ) : (
            <button type="button" className="kit-add" onClick={() => setAdding(true)}>＋ {t("kit.addContact")}</button>
          )}
          <small className="kit-muted">{t("kit.device")}</small>
        </div>

        <Link href="/emergency/card" className="kit-card kit-link">
          <h3>🪪 {t("kit.card")}</h3>
          <p className="kit-muted">{t("kit.cardHelp")}</p>
          <span className="card-arrow">{t("kit.open")} <b>→</b></span>
        </Link>

        <Link href="/emergency/labour" className="kit-card kit-link">
          <h3>⏱ {t("kit.labour")}</h3>
          <p className="kit-muted">{t("kit.labourHelp")}</p>
          <span className="card-arrow">{t("kit.open")} <b>→</b></span>
        </Link>
      </div>
    </section>
  );
}
