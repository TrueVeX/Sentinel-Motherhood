// Emergency phone numbers by country (ISO country code → numbers).
// Only countries whose numbers are well established are listed; anywhere else falls back to 112,
// which works from most mobile phones worldwide, with advice to dial the local number.
// Please double-check your own country's numbers before relying on them.

export type EmergencyNumber = { number: string; label: string };
export type CountryNumbers = { name: string; main: EmergencyNumber; extra?: EmergencyNumber[] };

const EU_112 = (name: string): CountryNumbers => ({ name, main: { number: "112", label: "Emergency" } });

export const EMERGENCY_NUMBERS: Record<string, CountryNumbers> = {
  IN: {
    name: "India",
    main: { number: "112", label: "Emergency" },
    extra: [
      { number: "108", label: "Ambulance" },
      { number: "102", label: "Maternity ambulance (most states)" },
      { number: "181", label: "Women's helpline" }
    ]
  },
  US: { name: "United States", main: { number: "911", label: "Emergency" } },
  CA: { name: "Canada", main: { number: "911", label: "Emergency" } },
  MX: { name: "Mexico", main: { number: "911", label: "Emergency" } },
  GB: { name: "United Kingdom", main: { number: "999", label: "Emergency" }, extra: [{ number: "111", label: "NHS non-emergency" }] },
  IE: { name: "Ireland", main: { number: "112", label: "Emergency" }, extra: [{ number: "999", label: "Emergency" }] },
  AU: { name: "Australia", main: { number: "000", label: "Emergency" } },
  NZ: { name: "New Zealand", main: { number: "111", label: "Emergency" } },
  JP: { name: "Japan", main: { number: "119", label: "Ambulance & fire" }, extra: [{ number: "110", label: "Police" }] },
  CN: { name: "China", main: { number: "120", label: "Ambulance" }, extra: [{ number: "110", label: "Police" }] },
  KR: { name: "South Korea", main: { number: "119", label: "Ambulance & fire" }, extra: [{ number: "112", label: "Police" }] },
  TW: { name: "Taiwan", main: { number: "119", label: "Ambulance & fire" }, extra: [{ number: "110", label: "Police" }] },
  HK: { name: "Hong Kong", main: { number: "999", label: "Emergency" } },
  SG: { name: "Singapore", main: { number: "995", label: "Ambulance" }, extra: [{ number: "999", label: "Police" }] },
  MY: { name: "Malaysia", main: { number: "999", label: "Emergency" } },
  ID: { name: "Indonesia", main: { number: "112", label: "Emergency" }, extra: [{ number: "119", label: "Ambulance" }] },
  PH: { name: "Philippines", main: { number: "911", label: "Emergency" } },
  TH: { name: "Thailand", main: { number: "1669", label: "Ambulance" }, extra: [{ number: "191", label: "Police" }] },
  VN: { name: "Vietnam", main: { number: "115", label: "Ambulance" }, extra: [{ number: "113", label: "Police" }] },
  BD: { name: "Bangladesh", main: { number: "999", label: "Emergency" } },
  PK: { name: "Pakistan", main: { number: "1122", label: "Rescue & ambulance" }, extra: [{ number: "115", label: "Edhi ambulance" }, { number: "15", label: "Police" }] },
  LK: { name: "Sri Lanka", main: { number: "1990", label: "Ambulance" }, extra: [{ number: "119", label: "Police" }] },
  NP: { name: "Nepal", main: { number: "102", label: "Ambulance" }, extra: [{ number: "100", label: "Police" }] },
  AE: { name: "United Arab Emirates", main: { number: "998", label: "Ambulance" }, extra: [{ number: "999", label: "Police" }] },
  SA: { name: "Saudi Arabia", main: { number: "997", label: "Ambulance" }, extra: [{ number: "911", label: "Emergency" }] },
  IL: { name: "Israel", main: { number: "101", label: "Ambulance" }, extra: [{ number: "100", label: "Police" }] },
  EG: { name: "Egypt", main: { number: "123", label: "Ambulance" }, extra: [{ number: "122", label: "Police" }] },
  TR: { name: "Türkiye", main: { number: "112", label: "Emergency" } },
  RU: { name: "Russia", main: { number: "112", label: "Emergency" }, extra: [{ number: "103", label: "Ambulance" }] },
  ZA: { name: "South Africa", main: { number: "10177", label: "Ambulance" }, extra: [{ number: "112", label: "From a mobile" }, { number: "10111", label: "Police" }] },
  NG: { name: "Nigeria", main: { number: "112", label: "Emergency" } },
  KE: { name: "Kenya", main: { number: "999", label: "Emergency" }, extra: [{ number: "112", label: "Emergency" }] },
  BR: { name: "Brazil", main: { number: "192", label: "Ambulance (SAMU)" }, extra: [{ number: "190", label: "Police" }] },
  CH: { name: "Switzerland", main: { number: "144", label: "Ambulance" }, extra: [{ number: "112", label: "Emergency" }] },
  NO: { name: "Norway", main: { number: "113", label: "Ambulance" }, extra: [{ number: "112", label: "Police" }] },
  DE: EU_112("Germany"),
  FR: EU_112("France"),
  IT: EU_112("Italy"),
  ES: EU_112("Spain"),
  PT: EU_112("Portugal"),
  NL: EU_112("Netherlands"),
  BE: EU_112("Belgium"),
  AT: EU_112("Austria"),
  SE: EU_112("Sweden"),
  DK: EU_112("Denmark"),
  FI: EU_112("Finland"),
  PL: EU_112("Poland"),
  GR: EU_112("Greece"),
  CZ: EU_112("Czechia"),
  RO: EU_112("Romania"),
  HU: EU_112("Hungary")
};

export const FALLBACK: CountryNumbers = { name: "your country", main: { number: "112", label: "Emergency" } };

export function numbersFor(code: string | null | undefined): { code: string | null; info: CountryNumbers } {
  const cc = code?.toUpperCase() ?? null;
  return cc && EMERGENCY_NUMBERS[cc] ? { code: cc, info: EMERGENCY_NUMBERS[cc] } : { code: null, info: FALLBACK };
}

// A first guess before any location is known: the device's time zone.
const TIMEZONES: Record<string, string> = {
  "Asia/Kolkata": "IN", "Asia/Calcutta": "IN", "Europe/London": "GB", "Europe/Dublin": "IE",
  "Australia/Sydney": "AU", "Australia/Melbourne": "AU", "Australia/Brisbane": "AU", "Australia/Perth": "AU", "Australia/Adelaide": "AU",
  "Pacific/Auckland": "NZ", "Asia/Tokyo": "JP", "Asia/Shanghai": "CN", "Asia/Seoul": "KR", "Asia/Taipei": "TW",
  "Asia/Hong_Kong": "HK", "Asia/Singapore": "SG", "Asia/Kuala_Lumpur": "MY", "Asia/Jakarta": "ID", "Asia/Manila": "PH",
  "Asia/Bangkok": "TH", "Asia/Ho_Chi_Minh": "VN", "Asia/Dhaka": "BD", "Asia/Karachi": "PK", "Asia/Colombo": "LK",
  "Asia/Kathmandu": "NP", "Asia/Dubai": "AE", "Asia/Riyadh": "SA", "Asia/Jerusalem": "IL", "Africa/Cairo": "EG",
  "Europe/Istanbul": "TR", "Europe/Moscow": "RU", "Africa/Johannesburg": "ZA", "Africa/Lagos": "NG", "Africa/Nairobi": "KE",
  "America/Sao_Paulo": "BR", "America/Mexico_City": "MX", "America/Toronto": "CA", "America/Vancouver": "CA",
  "America/New_York": "US", "America/Chicago": "US", "America/Denver": "US", "America/Los_Angeles": "US", "America/Phoenix": "US",
  "Europe/Zurich": "CH", "Europe/Oslo": "NO", "Europe/Berlin": "DE", "Europe/Paris": "FR", "Europe/Rome": "IT",
  "Europe/Madrid": "ES", "Europe/Lisbon": "PT", "Europe/Amsterdam": "NL", "Europe/Brussels": "BE", "Europe/Vienna": "AT",
  "Europe/Stockholm": "SE", "Europe/Copenhagen": "DK", "Europe/Helsinki": "FI", "Europe/Warsaw": "PL", "Europe/Athens": "GR",
  "Europe/Prague": "CZ", "Europe/Bucharest": "RO", "Europe/Budapest": "HU"
};

export function guessFromTimezone(): string | null {
  try {
    return TIMEZONES[Intl.DateTimeFormat().resolvedOptions().timeZone] ?? null;
  } catch {
    return null;
  }
}
