"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";

type Hospital = {
  name: string;
  lat: number;
  lon: number;
  distanceKm: number;
  address: string;
  phone: string | null;
  emergency: boolean;
};
type Origin = { lat: number; lon: number; label: string };
type Status = "idle" | "locating" | "loading" | "done" | "error";

const RADII = [5, 10, 25, 50];

function directionsUrl(h: Hospital) {
  return `https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}`;
}

// Build popups with text nodes so place names from the map data can't inject HTML.
function popupContent(h: Hospital) {
  const box = document.createElement("div");
  const title = document.createElement("strong");
  title.textContent = h.name;
  box.appendChild(title);
  const info = document.createElement("div");
  info.textContent = `${h.distanceKm} km away${h.emergency ? " · Emergency department" : ""}`;
  box.appendChild(info);
  const link = document.createElement("a");
  link.href = directionsUrl(h);
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "Directions ↗";
  box.appendChild(link);
  return box;
}

export default function HospitalMap() {
  const mapDiv = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const layerRef = useRef<Leaflet.LayerGroup | null>(null);
  const markersRef = useRef<Leaflet.Marker[]>([]);
  const leafletRef = useRef<typeof Leaflet | null>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [radius, setRadius] = useState(10);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<number | null>(null);

  // Create the map once (Leaflet needs the browser, so it's loaded here rather than on the server).
  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((L) => {
      if (cancelled || !mapDiv.current || mapRef.current) return;
      leafletRef.current = L;
      const map = L.map(mapDiv.current, { scrollWheelZoom: false }).setView([20, 0], 2);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
    });
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Draw "you are here", the search circle and numbered hospital pins.
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!L || !map || !layer || !origin) return;
    layer.clearLayers();
    markersRef.current = [];

    L.circle([origin.lat, origin.lon], {
      radius: radius * 1000,
      color: "#247C78",
      weight: 1,
      fillOpacity: 0.05
    }).addTo(layer);
    L.circleMarker([origin.lat, origin.lon], {
      radius: 8,
      color: "#FFFFFF",
      weight: 3,
      fillColor: "#2F6FDB",
      fillOpacity: 1
    })
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
      const marker = L.marker([h.lat, h.lon], { icon, title: h.name })
        .bindPopup(() => popupContent(h))
        .on("click", () => setSelected(i))
        .addTo(layer);
      markersRef.current.push(marker);
    });

    const points: [number, number][] = [[origin.lat, origin.lon], ...hospitals.map((h) => [h.lat, h.lon] as [number, number])];
    if (points.length > 1) map.fitBounds(points, { padding: [40, 40], maxZoom: 14 });
    else map.setView([origin.lat, origin.lon], 12);
  }, [origin, hospitals, radius]);

  async function search(from: Origin, km = radius) {
    setOrigin(from);
    setSelected(null);
    setStatus("loading");
    setMessage("Searching for hospitals…");
    try {
      const res = await fetch(`/api/hospitals?lat=${from.lat}&lon=${from.lon}&radius=${km}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setHospitals(data.hospitals);
      setStatus("done");
      setMessage(
        data.hospitals.length
          ? `Found ${data.hospitals.length} hospital${data.hospitals.length === 1 ? "" : "s"} within ${km} km of ${from.label}.`
          : `No hospitals found within ${km} km. Try a bigger distance.`
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

  function changeRadius(km: number) {
    setRadius(km);
    if (origin) search(origin, km);
  }

  function focus(i: number) {
    setSelected(i);
    const h = hospitals[i];
    mapRef.current?.flyTo([h.lat, h.lon], 15, { duration: 0.8 });
    markersRef.current[i]?.openPopup();
    mapDiv.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  const busy = status === "locating" || status === "loading";

  return (
    <section className="map-section section-wrap" id="hospitals">
      <div className="section-heading">
        <div>
          <div className="eyebrow">NEARBY HOSPITALS</div>
          <h2>Know where to go, <em>before you need to.</em></h2>
        </div>
        <p>Use your location or type a town to see hospitals near you on the map. In an emergency, call your local emergency number.</p>
      </div>

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

      {message && <p className={`map-status ${status}`} role="status">{message}</p>}

      <div className="map-layout">
        <div className="map-frame" ref={mapDiv} aria-label="Map of nearby hospitals" />
        <ol className="hospital-list" aria-label="Hospitals, nearest first">
          {hospitals.length === 0 && (
            <li className="hospital-empty">{busy ? "Searching…" : "Hospitals will appear here, nearest first."}</li>
          )}
          {hospitals.map((h, i) => (
            <li key={`${h.lat},${h.lon}`} className={selected === i ? "selected" : ""}>
              <button type="button" className="hospital-main" onClick={() => focus(i)}>
                <span className={`map-pin${h.emergency ? " er" : ""}`}>{i + 1}</span>
                <span>
                  <strong>{h.name}</strong>
                  <small>
                    {h.distanceKm} km{h.address ? ` · ${h.address}` : ""}
                  </small>
                  {h.emergency && <em className="er-tag">Emergency department</em>}
                </span>
              </button>
              <div className="hospital-actions">
                <a href={directionsUrl(h)} target="_blank" rel="noopener noreferrer">Directions ↗</a>
                {h.phone && <a href={`tel:${h.phone.split(";")[0].replace(/[^+\d]/g, "")}`}>Call</a>}
              </div>
            </li>
          ))}
        </ol>
      </div>
      <small className="map-foot">Map and hospital data © OpenStreetMap contributors. Listings may be incomplete or out of date.</small>
    </section>
  );
}
