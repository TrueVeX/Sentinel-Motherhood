"use client";

import { EMERGENCY_NUMBERS, numbersFor } from "@/lib/emergency-numbers";

const COUNTRIES = Object.entries(EMERGENCY_NUMBERS).sort((a, b) => a[1].name.localeCompare(b[1].name));

/** Emergency call buttons for the visitor's country, with a picker to change it. */
export default function EmergencyCall({
  country,
  onChange
}: {
  country: string | null;
  onChange: (code: string | null) => void;
}) {
  const { code, info } = numbersFor(country);

  return (
    <div className="call-emergency" aria-label="Emergency numbers">
      <div className="call-buttons">
        <a href={`tel:${info.main.number}`} className="call-112">
          📞 Call {info.main.number} · {info.main.label}
        </a>
        {info.extra?.map((n) => (
          <a key={n.number} href={`tel:${n.number}`} className="call-extra">
            {n.number} · {n.label}
          </a>
        ))}
      </div>
      <div className="call-country">
        <p>
          {code ? (
            <>Showing emergency numbers for <strong>{info.name}</strong>.</>
          ) : (
            <>112 works from most mobile phones worldwide. If it doesn’t, dial your local emergency number.</>
          )}
        </p>
        <label>
          <span>Change country</span>
          <select value={code ?? ""} onChange={(e) => onChange(e.target.value || null)} aria-label="Country for emergency numbers">
            <option value="">Other / not listed (112)</option>
            {COUNTRIES.map(([cc, c]) => (
              <option key={cc} value={cc}>{c.name}</option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
