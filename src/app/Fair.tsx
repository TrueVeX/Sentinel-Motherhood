"use client";

import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";

type Counts = { yes: number; maybe: number; no: number };
type Stats = { visits: number; questions: number; aiAnswers: number; offlineAnswers: number };

const POLL_OPTIONS: { key: keyof Counts; label: string }[] = [
  { key: "yes", label: "Yes!" },
  { key: "maybe", label: "Maybe" },
  { key: "no", label: "Not really" }
];

function readFlag(key: string) {
  try { return window.localStorage.getItem(key); } catch { return null; }
}
function writeFlag(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch { /* ignore */ }
}

function QrCard() {
  const [urls, setUrls] = useState<string[]>([]);
  const [url, setUrl] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    fetch("/api/network")
      .then((r) => r.json())
      .then((data: { urls: string[] }) => {
        setUrls(data.urls);
        setUrl(data.urls[0] ?? window.location.origin);
      })
      .catch(() => setUrl(window.location.origin));
  }, []);

  useEffect(() => {
    if (!url) return;
    QRCode.toDataURL(url, { width: 320, margin: 1, color: { dark: "#123F46", light: "#FFFFFF" } })
      .then(setImage)
      .catch(() => setImage(""));
  }, [url]);

  return (
    <div className="fair-card qr-card">
      <h3>Try it on your phone</h3>
      <p>Scan with your camera. Your phone must be on the same Wi-Fi as this laptop.</p>
      {image ? <img src={image} alt={`QR code for ${url}`} width={190} height={190} /> : <div className="qr-placeholder" />}
      {urls.length > 1 ? (
        <select value={url} onChange={(e) => setUrl(e.target.value)} aria-label="Network address">
          {urls.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
      ) : (
        <code>{url}</code>
      )}
    </div>
  );
}

function PollCard() {
  const [counts, setCounts] = useState<Counts>({ yes: 0, maybe: 0, no: 0 });
  const [voted, setVoted] = useState<string | null>(null);

  const refresh = useCallback(() => {
    fetch("/api/poll").then((r) => r.json()).then(setCounts).catch(() => undefined);
  }, []);

  useEffect(() => {
    setVoted(readFlag("sm-voted"));
    refresh();
    const timer = setInterval(refresh, 4000);
    return () => clearInterval(timer);
  }, [refresh]);

  async function vote(choice: keyof Counts) {
    const res = await fetch("/api/poll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ choice })
    }).catch(() => null);
    if (!res?.ok) return;
    setCounts(await res.json());
    setVoted(choice);
    writeFlag("sm-voted", choice);
  }


  const total = counts.yes + counts.maybe + counts.no;

  return (
    <div className="fair-card poll-card" id="poll">
      <h3>Would this app help a new mum?</h3>
      <p>{voted ? "Thanks for voting! Here are the live results." : "Tap to vote. Results update live."}</p>
      <div className="poll-options">
        {POLL_OPTIONS.map(({ key, label }) => {
          const pct = total ? Math.round((counts[key] / total) * 100) : 0;
          return (
            <button type="button" key={key} className={voted === key ? "poll-option chosen" : "poll-option"} onClick={() => vote(key)} disabled={!!voted}>
              <span className="poll-fill" style={{ width: voted ? `${pct}%` : 0 }} />
              <span className="poll-label">{label}</span>
              {voted && <span className="poll-pct">{pct}% · {counts[key]}</span>}
            </button>
          );
        })}
      </div>
      <div className="poll-foot">
        <span>{total} {total === 1 ? "vote" : "votes"}</span>
      </div>
    </div>
  );
}

function StatsCard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let alive = true;
    const refresh = () =>
      fetch("/api/stats").then((r) => r.json()).then((s) => alive && setStats(s)).catch(() => undefined);
    refresh();
    const timer = setInterval(refresh, 5000);
    return () => { alive = false; clearInterval(timer); };
  }, []);

  const items = [
    { label: "Visits", value: stats?.visits },
    { label: "Questions asked", value: stats?.questions },
    { label: "AI answers", value: stats?.aiAnswers },
    { label: "Offline answers", value: stats?.offlineAnswers }
  ];

  return (
    <div className="fair-card stats-card">
      <h3>Live stats</h3>
      <p>Counted by the app’s own server on this laptop.</p>
      <div className="stats-grid">
        {items.map((i) => (
          <div key={i.label}><strong>{i.value ?? "–"}</strong><small>{i.label}</small></div>
        ))}
      </div>
    </div>
  );
}

export default function Fair() {
  useEffect(() => {
    try {
      if (window.sessionStorage.getItem("sm-visit")) return;
      window.sessionStorage.setItem("sm-visit", "1");
    } catch { /* count anyway */ }
    fetch("/api/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "visit" })
    }).catch(() => undefined);
  }, []);

  return (
    <section className="fair-section section-wrap" id="visit">
      <div className="section-heading">
        <div>
          <div className="eyebrow">SCIENCE FAIR CORNER</div>
          <h2>Thanks for <em>visiting!</em></h2>
        </div>
        <p>Scan to try Sentinel on your phone, vote in our poll and watch the live stats.</p>
      </div>
      <div className="fair-grid">
        <QrCard />
        <PollCard />
        <StatsCard />
      </div>
    </section>
  );
}
