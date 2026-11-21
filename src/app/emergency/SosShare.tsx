"use client";

import { useEffect, useState } from "react";
import { currentLocation, loadContacts, mapsLink, savedCountry, whatsappNumber, type Contact } from "@/lib/kit";
import { useI18n } from "../I18n";

/**
 * SOS: gets your location, writes "I need help. This is my location: <map link>", then offers
 * WhatsApp / SMS to each emergency contact, or the phone's own share sheet.
 * Nothing is sent automatically. You choose who to send it to.
 */
export default function SosShare({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "locating" | "ready">("idle");
  const [note, setNote] = useState("");
  const [country, setCountry] = useState<string | null>(null);

  useEffect(() => {
    setContacts(loadContacts());
    setCountry(savedCountry());
  }, []);

  async function start() {
    setStatus("locating");
    setNote(t("kit.locating"));
    setContacts(loadContacts());
    const loc = await currentLocation();
    const text = loc ? `${t("kit.sosMessage")} ${mapsLink(loc.lat, loc.lon)}` : t("kit.sosMessage").replace(/[:：]\s*$/, ".");
    setMessage(text);
    setNote(loc ? t("kit.ready") : `${t("kit.noLocation")} ${t("kit.ready")}`);
    setStatus("ready");
  }

  async function shareOther() {
    if (!message) return;
    if (navigator.share) {
      try {
        await navigator.share({ text: message });
      } catch {
        /* cancelled */
      }
    } else {
      await navigator.clipboard?.writeText(message).catch(() => undefined);
    }
  }

  return (
    <div className={compact ? "sos compact" : "sos"}>
      <button type="button" className="sos-button" onClick={start} disabled={status === "locating"}>
        🆘 {t("kit.sos")}
      </button>
      {!compact && <p className="sos-help">{t("kit.sosHelp")}</p>}
      {note && <p className="sos-note" role="status">{note}</p>}
      {status === "ready" && message && (
        <div className="sos-send">
          {contacts.map((c) => (
            <div key={c.id} className="sos-contact">
              <strong>{c.name}</strong>
              <a href={`https://wa.me/${whatsappNumber(c.phone, country)}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" className="sos-wa">
                {t("kit.whatsapp")}
              </a>
              <a href={`sms:${c.phone.replace(/[^+\d]/g, "")}?body=${encodeURIComponent(message)}`} className="sos-sms">
                {t("kit.sms")}
              </a>
            </div>
          ))}
          <button type="button" className="sos-other" onClick={shareOther}>↗ {t("kit.shareOther")}</button>
          {contacts.length === 0 && <p className="sos-help">{t("kit.noContacts")}</p>}
        </div>
      )}
    </div>
  );
}
