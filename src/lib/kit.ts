// The emergency kit: contacts and medical card, saved only in this browser (works offline,
// never sent to the server).
import { load, save } from "./browser-storage";
import { guessFromTimezone } from "./emergency-numbers";

export type Contact = { id: string; name: string; phone: string; relation: string };
export type MedicalCard = {
  blood: string;
  allergies: string;
  conditions: string;
  medicines: string;
  dueDate: string;
  doctor: string;
  doctorPhone: string;
  hospital: string;
  hospitalPhone: string;
  notes: string;
};

export const EMPTY_CARD: MedicalCard = {
  blood: "", allergies: "", conditions: "", medicines: "", dueDate: "",
  doctor: "", doctorPhone: "", hospital: "", hospitalPhone: "", notes: ""
};

export const loadContacts = () => load<Contact[]>("sm-contacts", []);
export const saveContacts = (c: Contact[]) => save("sm-contacts", c);
export const loadCard = () => ({ ...EMPTY_CARD, ...load<Partial<MedicalCard>>("sm-medical", {}) });
export const saveCard = (c: MedicalCard) => save("sm-medical", c);

/** The country for emergency numbers: the visitor's saved choice, else a guess from the time zone. */
export const savedCountry = () => load<string | null>("sm-emergency-country", null) ?? guessFromTimezone();

export const telHref = (phone: string) => `tel:${phone.replace(/[^+\d]/g, "")}`;

/** WhatsApp needs the full international number without "+": add India's 91 to plain 10-digit numbers. */
export function whatsappNumber(phone: string, country: string | null) {
  let digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits.slice(1);
  digits = digits.replace(/^0+/, "");
  if (country === "IN" && digits.length === 10) return `91${digits}`;
  return digits;
}

/** Ask for the current location (resolves null if unavailable or refused). */
export function currentLocation(timeoutMs = 10000): Promise<{ lat: number; lon: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation || !window.isSecureContext) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 60000 }
    );
  });
}

export const mapsLink = (lat: number, lon: number) => `https://maps.google.com/?q=${lat.toFixed(5)},${lon.toFixed(5)}`;
