"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import { guessFromTimezone } from "@/lib/emergency-numbers";
import { load, save } from "@/lib/browser-storage";
import EmergencyCall from "./EmergencyCall";
import { useI18n } from "./I18n";

type Hospital = {
  name: string;
  lat: number;
  lon: number;
  distanceKm: number;
  address: string;
  phone: string | null;
  emergency: boolean;
  openNow: boolean | null;
  hours: string[] | null;
  mapsUrl: string | null;
  source: "google" | "osm";
};
type Origin = { lat: number; lon: number; label: string };
type Status = "idle" | "locating" | "loading" | "done" | "error";

/** One map, drawn either with Google Maps or with OpenStreetMap (Leaflet). */
type MapEngine = {
  draw(origin: Origin, hospitals: Hospital[], radiusKm: number, onSelect: (i: number) => void): void;
  focus(i: number): void;
  destroy(): void;
};

const RADII = [5, 10, 25, 50];
const KINDS = [
  { key: "hospital", icon: "🏥", label: "map.hospitals" },
  { key: "pharmacy", icon: "💊", label: "map.pharmacies" },
  { key: "clinic", icon: "🩺", label: "map.clinics" },
  { key: "blood", icon: "🩸", label: "map.blood" }
];

const telHref = (phone: string) => `tel:${phone.split(";")[0].replace(/[^+\d]/g, "")}`;
const directionsUrl = (h: Hospital) => `https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}`;

/** Today's line from Google's weekly hours (Google lists Monday first). */
function todaysHours(h: Hospital) {
  if (!h.hours?.length) return null;
  if (h.source === "osm") return h.hours[0] === "24/7" ? "Open 24/7" : `Hours: ${h.hours[0]}`;
  const line = h.hours[(new Date().getDay() + 6) % 7] ?? "";
  return line.replace(/^[^:]+:\s*/, "Today: ");
}

// Map popups are built from text nodes, so place names from map data can never inject HTML.
function popupContent(h: Hospital) {
  const box = document.createElement("div");
  box.className = "map-popup";
  const title = document.createElement("strong");
  title.textContent = h.name;
  box.appendChild(title);
  const info = document.createElement("div");
  info.textContent = `${h.distanceKm} km away${h.openNow === true ? " · Open now" : h.openNow === false ? " · Closed now" : ""}`;
  box.appendChild(info);
  const links = document.createElement("div");
  links.className = "map-popup-links";
  if (h.phone) {
    const call = document.createElement("a");
    call.href = telHref(h.phone);
    call.textContent = `📞 Call ${h.phone}`;
    links.appendChild(call);
  }
  const dir = document.createElement("a");
  dir.href = directionsUrl(h);
  dir.target = "_blank";
  dir.rel = "noopener noreferrer";
  dir.textContent = "Directions ↗";
  links.appendChild(dir);
  box.appendChild(links);
  return box;
}

// ---------------- OpenStreetMap (free, default) ----------------
async function createLeafletEngine(el: HTMLDivElement): Promise<MapEngine> {
  const L = await import("leaflet");
  const map = L.map(el, { scrollWheelZoom: false }).setView([20, 0], 2);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  const layer = L.layerGroup().addTo(map);
  let markers: ReturnType<typeof L.marker>[] = [];
  let latest: Hospital[] = [];

  return {
    draw(origin, hospitals, radiusKm, onSelect) {
      latest = hospitals;
      layer.clearLayers();
      markers = [];
      L.circle([origin.lat, origin.lon], { radius: radiusKm * 1000, color: "#247C78", weight: 1, fillOpacity: 0.05 }).addTo(layer);
      L.circleMarker([origin.lat, origin.lon], { radius: 8, color: "#FFFFFF", weight: 3, fillColor: "#2F6FDB", fillOpacity: 1 })
        .bindTooltip("You are here")
        .addTo(layer);
      hospitals.forEach((h, i) => {
        const icon = L.divIcon({
          className: "",
          html: `<span class="map-pin${h.emergency ? " er" : ""}"><b>${i + 1}</b></span>`,
          iconSize: [28, 28],
          iconAnchor: [14, 28],
          popupAnchor: [0, -26]
        });
        markers.push(
          L.marker([h.lat, h.lon], { icon, title: h.name })
            .bindPopup(() => popupContent(h))
            .on("click", () => onSelect(i))
            .addTo(layer)
        );
      });
      const points: [number, number][] = [[origin.lat, origin.lon], ...hospitals.map((h) => [h.lat, h.lon] as [number, number])];
      if (points.length > 1) map.fitBounds(points, { padding: [40, 40], maxZoom: 14 });
      else map.setView([origin.lat, origin.lon], 12);
    },
    focus(i) {
      const h = latest[i];
      if (!h) return;
      map.flyTo([h.lat, h.lon], 15, { duration: 0.8 });
      markers[i]?.openPopup();
    },
    destroy() {
      map.remove();
    }
  };
}

// ---------------- Google Maps (when keys are set) ----------------
/* eslint-disable @typescript-eslint/no-explicit-any */
type GMaps = any;

function loadGoogleMaps(key: string): Promise<GMaps> {
  const w = window as any;
  if (w.google?.maps?.Map) return Promise.resolve(w.google.maps);
  if (w.__smGoogleMapsLoading) return w.__smGoogleMapsLoading;
  w.__smGoogleMapsLoading = new Promise((resolve, reject) => {
    w.__smGoogleMapsReady = () => resolve(w.google.maps);
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&loading=async&callback=__smGoogleMapsReady`;
    s.async = true;
    s.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(s);
  });
  return w.__smGoogleMapsLoading;
}

async function createGoogleEngine(el: HTMLDivElement, key: string, onAuthFail: () => void): Promise<MapEngine> {
  // Google calls this if the key is wrong or not allowed for this site.
  (window as any).gm_authFailure = onAuthFail;
  const g = await loadGoogleMaps(key);
  const map = new g.Map(el, {
    center: { lat: 20, lng: 0 },
    zoom: 2,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    gestureHandling: "cooperative"
  });
  const info = new g.InfoWindow();
  let markers: GMaps[] = [];
  let extras: GMaps[] = [];
  let latest: Hospital[] = [];

  const open = (i: number) => {
    const h = latest[i];
    if (!h || !markers[i]) return;
    info.setContent(popupContent(h));
    info.open({ map, anchor: markers[i] });
  };

  return {
    draw(origin, hospitals, radiusKm, onSelect) {
      latest = hospitals;
      [...markers, ...extras].forEach((m) => m.setMap(null));
      markers = [];
      extras = [
        new g.Circle({ map, center: { lat: origin.lat, lng: origin.lon }, radius: radiusKm * 1000, strokeColor: "#247C78", strokeWeight: 1, fillColor: "#247C78", fillOpacity: 0.05 }),
        new g.Marker({
          map,
          position: { lat: origin.lat, lng: origin.lon },
          title: "You are here",
          icon: { path: g.SymbolPath.CIRCLE, scale: 8, fillColor: "#2F6FDB", fillOpacity: 1, strokeColor: "#FFFFFF", strokeWeight: 3 }
        })
      ];
      const bounds = new g.LatLngBounds();
      bounds.extend({ lat: origin.lat, lng: origin.lon });
      hospitals.forEach((h, i) => {
        const marker = new g.Marker({
          map,
          position: { lat: h.lat, lng: h.lon },
          title: h.name,
          label: { text: String(i + 1), color: "#FFFFFF", fontWeight: "700", fontSize: "12px" },
          icon: { path: g.SymbolPath.CIRCLE, scale: 13, fillColor: h.emergency ? "#A4402F" : "#247C78", fillOpacity: 1, strokeColor: "#FFFFFF", strokeWeight: 2 }
        });
        marker.addListener("click", () => {
          onSelect(i);
          open(i);
        });
        markers.push(marker);
        bounds.extend({ lat: h.lat, lng: h.lon });
      });
      if (hospitals.length) map.fitBounds(bounds, 40);
      else {
        map.setCenter({ lat: origin.lat, lng: origin.lon });
        map.setZoom(12);
      }
    },
    focus(i) {
      const h = latest[i];
      if (!h) return;
      map.panTo({ lat: h.lat, lng: h.lon });
      map.setZoom(15);
      open(i);
    },
    destroy() {
      [...markers, ...extras].forEach((m) => m.setMap(null));
      info.close();
    }
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export default function HospitalMap({ googleMapsKey, initialCountry }: { googleMapsKey?: string; initialCountry?: string }) {
  const mapDiv = useRef<HTMLDivElement>(null);
  const engineRef = useRef<MapEngine | null>(null);
  const drawnRef = useRef<{ origin: Origin; hospitals: Hospital[]; radius: number } | null>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [radius, setRadius] = useState(10);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const [useGoogle, setUseGoogle] = useState(!!googleMapsKey);
  const [provider, setProvider] = useState<"google" | "osm" | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(initialCountry?.toUpperCase() ?? null);
  const [kind, setKind] = useState("hospital");
  const { t } = useI18n();

  // Country for emergency numbers: a saved choice first, otherwise Vercel's guess, otherwise the time zone.
  useEffect(() => {
    const saved = load<string | null>("sm-emergency-country", null);
    if (saved) setCountry(saved);
    else if (!initialCountry) setCountry(guessFromTimezone());
  }, [initialCountry]);

  function chooseCountry(code: string | null) {
    setCountry(code);
    save("sm-emergency-country", code);
  }

  // Create the map (Google Maps if a key is set, otherwise OpenStreetMap).
  useEffect(() => {
    let cancelled = false;
    const el = mapDiv.current;
    if (!el) return;
    const fallBack = () => {
      if (cancelled) return;
      console.warn("Google Maps unavailable; using OpenStreetMap.");
      setUseGoogle(false);
    };
    const make = useGoogle && googleMapsKey ? createGoogleEngine(el, googleMapsKey, fallBack) : createLeafletEngine(el);
    make
      .then((engine) => {
        if (cancelled) return engine.destroy();
        engineRef.current = engine;
        const d = drawnRef.current;
        if (d) engine.draw(d.origin, d.hospitals, d.radius, setSelected);
      })
      .catch(fallBack);
    return () => {
      cancelled = true;
      engineRef.current?.destroy();
      engineRef.current = null;
      el.innerHTML = "";
    };
  }, [useGoogle, googleMapsKey]);

  // Redraw pins whenever the results change.
  useEffect(() => {
    if (!origin) return;
    drawnRef.current = { origin, hospitals, radius };
    engineRef.current?.draw(origin, hospitals, radius, setSelected);
  }, [origin, hospitals, radius]);

  async function search(from: Origin, km = radius, what = kind) {
    setOrigin(from);
    setSelected(null);
    setStatus("loading");
    setMessage("Searching for hospitals…");
    try {
      // Google's hospital details may only be shown on a Google map, so ask for them only then.
      const map = useGoogle ? "google" : "osm";
      const res = await fetch(`/api/hospitals?lat=${from.lat}&lon=${from.lon}&radius=${km}&map=${map}&kind=${what}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setHospitals(data.hospitals);
      setProvider(data.provider ?? "osm");
      setFetchedAt(data.fetchedAt ?? null);
      // Show the emergency numbers for the country being searched.
      if (data.country) setCountry(data.country);
      setStatus("done");
      setMessage(
        data.hospitals.length
          ? `${t(KINDS.find((k) => k.key === what)?.label ?? "map.hospitals")}: ${data.hospitals.length} · ${km} km · ${from.label}`
          : `0 · ${km} km. Try a bigger distance.`
      );
    } catch {
      setHospitals([]);
      setStatus("error");
      setMessage("Couldn’t load hospitals right now. Check the internet connection and try again.");
    }
  }

  function useGps() {
    if (!window.isSecureContext || !navigator.geolocation) {
      setStatus("error");
      setMessage("This browser only allows location on secure (https) pages. Search by town or postcode instead.");
      return;
    }
    setStatus("locating");
    setMessage("Finding your location… please allow location access if asked.");
    navigator.geolocation.getCurrentPosition(
      (pos) => search({ lat: pos.coords.latitude, lon: pos.coords.longitude, label: "your location" }),
      (err) => {
        setStatus("error");
        setMessage(
          err.code === err.PERMISSION_DENIED
            ? "Location access was blocked. Allow it in your browser settings, or search by town instead."
            : "Couldn’t get your location. Try again, or search by town instead."
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }

  async function searchPlace(event: React.FormEvent) {
    event.preventDefault();
    const q = query.trim();
    if (q.length < 2) return;
    setStatus("loading");
    setMessage(`Looking up “${q}”…`);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await search({ lat: data.lat, lon: data.lon, label: q });
    } catch {
      setStatus("error");
      setMessage(`Couldn’t find “${q}”. Try a city name or postcode.`);
    }
  }

  function changeKind(k: string) {
    setKind(k);
    if (origin) search(origin, radius, k);
  }

  function changeRadius(km: number) {
    setRadius(km);
    if (origin) search(origin, km);
  }

  function focus(i: number) {
    setSelected(i);
    engineRef.current?.focus(i);
    mapDiv.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  const busy = status === "locating" || status === "loading";
  const updated = fetchedAt ? new Date(fetchedAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : null;

  return (
    <section className="map-section section-wrap" id="hospitals">
      <div className="section-heading">
        <div>
          <div className="eyebrow">NEARBY HOSPITALS</div>
          <h2>Know where to go, <em>before you need to.</em></h2>
        </div>
        <p>Use your location or type a town to see hospitals near you, with their phone numbers. Tap <strong>Call</strong> to phone them directly.</p>
      </div>

      <EmergencyCall country={country} onChange={chooseCountry} />

      <div className="map-controls">
        <button type="button" className="button button-primary gps-button" onClick={useGps} disabled={busy}>
          📍 Use my location
        </button>
        <form className="place-search" onSubmit={searchPlace}>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="or type a town or postcode" aria-label="Town or postcode" maxLength={100} />
          <button type="submit" disabled={busy || query.trim().length < 2}>Search</button>
        </form>
        <div className="radius-pick" role="radiogroup" aria-label="Search distance">
          {RADII.map((km) => (
            <button type="button" role="radio" aria-checked={radius === km} key={km} className={radius === km ? "active" : ""} onClick={() => changeRadius(km)} disabled={busy}>
              {km} km
            </button>
          ))}
        </div>
      </div>

      <div className="kind-pick" role="radiogroup" aria-label="What to show on the map">
        {KINDS.map((k) => (
          <button type="button" role="radio" key={k.key} aria-checked={kind === k.key} className={kind === k.key ? "active" : ""} onClick={() => changeKind(k.key)} disabled={busy}>
            <span aria-hidden="true">{k.icon}</span> {t(k.label)}
          </button>
        ))}
      </div>

      {message && <p className={`map-status ${status}`} role="status">{message}</p>}

      <div className="map-layout">
        <div className="map-frame" ref={mapDiv} aria-label="Map of nearby hospitals" />
        <ol className="hospital-list" aria-label="Hospitals, nearest first">
          {hospitals.length === 0 && (
            <li className="hospital-empty">{busy ? "Searching…" : "Hospitals will appear here, nearest first."}</li>
          )}
          {hospitals.map((h, i) => {
            const today = todaysHours(h);
            return (
              <li key={`${h.lat},${h.lon}`} className={selected === i ? "selected" : ""}>
                <button type="button" className="hospital-main" onClick={() => focus(i)}>
                  <span className={`map-pin${h.emergency ? " er" : ""}`}>{i + 1}</span>
                  <span>
                    <strong>{h.name}</strong>
                    <small>
                      {h.distanceKm} km{h.address ? ` · ${h.address}` : ""}
                    </small>
                    <span className="hospital-tags">
                      {h.openNow === true && <em className="open-tag">Open now</em>}
                      {h.openNow === false && <em className="closed-tag">Closed now</em>}
                      {h.emergency && <em className="er-tag">Emergency</em>}
                    </span>
                    {today && <small className="hospital-hours">{today}</small>}
                    {h.phone && <small className="hospital-phone">☎ {h.phone}</small>}
                  </span>
                </button>
                <div className="hospital-actions">
                  {h.phone ? (
                    <a className="call-button" href={telHref(h.phone)} aria-label={`Call ${h.name} on ${h.phone}`}>📞 Call</a>
                  ) : (
                    h.mapsUrl && (
                      <a className="find-number" href={h.mapsUrl} target="_blank" rel="noopener noreferrer">Find number on Google Maps ↗</a>
                    )
                  )}
                  <a href={directionsUrl(h)} target="_blank" rel="noopener noreferrer">Directions ↗</a>
                  {h.phone && h.mapsUrl && (
                    <a href={h.mapsUrl} target="_blank" rel="noopener noreferrer">Google Maps ↗</a>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
      <small className="map-foot">
        {provider === "google" && useGoogle
          ? `Hospital phone numbers and opening hours from Google Maps, checked live at ${updated}.`
          : "Map and hospital data © OpenStreetMap contributors. Phone numbers may be missing or out of date — use “Find number on Google Maps” for the latest."}
      </small>
    </section>
  );
}
