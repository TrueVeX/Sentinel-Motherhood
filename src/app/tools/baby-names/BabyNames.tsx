"use client";

import { useEffect, useMemo, useState } from "react";
import { BABY_NAMES, type BabyName } from "@/lib/content";
import { load, save } from "@/lib/browser-storage";

const FILTERS: { key: "all" | BabyName["gender"]; label: string }[] = [
  { key: "all", label: "All" },
  { key: "girl", label: "Girls" },
  { key: "boy", label: "Boys" },
  { key: "any", label: "Any gender" }
];

export default function BabyNames() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [letter, setLetter] = useState("");
  const [text, setText] = useState("");
  const [favs, setFavs] = useState<string[]>([]);
  const [pick, setPick] = useState<string | null>(null);

  useEffect(() => setFavs(load<string[]>("sm-fav-names", [])), []);

  const letters = useMemo(() => [...new Set(BABY_NAMES.map((n) => n.name[0]))], []);
  const names = BABY_NAMES.filter(
    (n) =>
      (filter === "all" || n.gender === filter) &&
      (!letter || n.name.startsWith(letter)) &&
      n.name.toLowerCase().includes(text.trim().toLowerCase())
  );

  function toggleFav(name: string) {
    const next = favs.includes(name) ? favs.filter((f) => f !== name) : [...favs, name];
    setFavs(next);
    save("sm-fav-names", next);
  }

  function surprise() {
    if (names.length) setPick(names[Math.floor(Math.random() * names.length)].name);
  }

  return (
    <div className="names-layout">
      <div>
        <div className="names-controls">
          <div className="segmented" role="radiogroup" aria-label="Filter by gender">
            {FILTERS.map((f) => (
              <button key={f.key} type="button" role="radio" aria-checked={filter === f.key} className={filter === f.key ? "active" : ""} onClick={() => setFilter(f.key)}>
                {f.label}
              </button>
            ))}
          </div>
          <input className="names-search" value={text} onChange={(e) => setText(e.target.value)} placeholder="Search names" aria-label="Search names" />
          <button type="button" className="button button-primary" onClick={surprise}>🎲 Surprise me</button>
        </div>
        <div className="letter-row" aria-label="Filter by first letter">
          <button type="button" className={!letter ? "active" : ""} onClick={() => setLetter("")}>All</button>
          {letters.map((l) => (
            <button type="button" key={l} className={letter === l ? "active" : ""} onClick={() => setLetter(letter === l ? "" : l)}>{l}</button>
          ))}
        </div>
        {pick && (
          <p className="name-pick" role="status">
            How about <strong>{pick}</strong>?{" "}
            <button type="button" className="link-button" onClick={() => toggleFav(pick)}>{favs.includes(pick) ? "♥ Saved" : "♡ Save"}</button>
          </p>
        )}
        <ul className="name-grid">
          {names.map((n) => (
            <li key={n.name}>
              <span className={`name-dot ${n.gender}`} aria-hidden="true" />
              <span>{n.name}</span>
              <button type="button" onClick={() => toggleFav(n.name)} aria-pressed={favs.includes(n.name)} aria-label={`${favs.includes(n.name) ? "Remove" : "Save"} ${n.name}`}>
                {favs.includes(n.name) ? "♥" : "♡"}
              </button>
            </li>
          ))}
          {!names.length && <li className="names-empty">No names match. Try another letter.</li>}
        </ul>
      </div>
      <aside className="fav-card">
        <h2>My favourites</h2>
        {favs.length ? (
          <ul>
            {favs.map((f) => (
              <li key={f}>{f}<button type="button" onClick={() => toggleFav(f)} aria-label={`Remove ${f}`}>×</button></li>
            ))}
          </ul>
        ) : (
          <p>Tap ♡ on a name to save it here.</p>
        )}
      </aside>
    </div>
  );
}
