import { distanceKm, nominatim } from "@/lib/nominatim";
import { GOOGLE_TYPES, googleHospitals, isGoogleEnabled, type HospitalResult } from "@/lib/places";

// Kinds of place the map can show, and how to ask OpenStreetMap for each.
const OSM_QUERY: Record<string, Record<string, string>> = {
  hospital: { amenity: "hospital" },
  pharmacy: { amenity: "pharmacy" },
  clinic: { amenity: "clinic" },
  blood: { q: "blood bank" }
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Place = {
  name: string;
  display_name: string;
  lat: string;
  lon: string;
  extratags?: Record<string, string> | null;
  address?: Record<string, string>;
};

function shortAddress(a: Record<string, string> = {}) {
  const street = [a.house_number, a.road].filter(Boolean).join(" ");
  return [street, a.suburb || a.neighbourhood, a.city || a.town || a.village].filter(Boolean).join(", ");
}

/** Which country a point is in (for showing the right emergency numbers). Rounded and cached. */
async function countryAt(lat: number, lon: number): Promise<string | null> {
  try {
    const r = await nominatim<{ address?: { country_code?: string } }>("/reverse", {
      lat: lat.toFixed(2),
      lon: lon.toFixed(2),
      format: "jsonv2",
      zoom: "3"
    });
    return r.address?.country_code?.toUpperCase() ?? null;
  } catch {
    return null;
  }
}

// GET /api/hospitals?lat=..&lon=..&radius=10  (radius in km)
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const lat = Number(params.get("lat"));
  const lon = Number(params.get("lon"));
  const radius = Math.min(50, Math.max(2, Number(params.get("radius")) || 10));
  const kind = OSM_QUERY[params.get("kind") ?? ""] ? (params.get("kind") as string) : "hospital";
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    return Response.json({ error: "bad_location" }, { status: 400 });
  }

  // Round the location (~100 m) so nearby searches share the cache and exact positions aren't sent.
  const rLat = Math.round(lat * 1000) / 1000;
  const rLon = Math.round(lon * 1000) / 1000;

  const country = await countryAt(rLat, rLon);

  // Google Maps first (live phone numbers and opening hours), when both Google keys are set.
  if (isGoogleEnabled() && params.get("map") === "google" && GOOGLE_TYPES[kind]) {
    try {
      const hospitals = (await googleHospitals(rLat, rLon, radius, kind)).filter((h) => h.distanceKm <= radius);
      return Response.json(
        { hospitals, radius, kind, country, provider: "google", fetchedAt: new Date().toISOString() },
        { headers: { "Cache-Control": "no-store" } }
      );
    } catch (e) {
      console.error("Google Places failed, using OpenStreetMap instead:", e instanceof Error ? e.message : e);
    }
  }

  const dLat = radius / 111;
  const dLon = radius / (111 * Math.max(0.1, Math.cos((rLat * Math.PI) / 180)));

  try {
    const places = await nominatim<Place[]>("/search", {
      ...OSM_QUERY[kind],
      format: "jsonv2",
      limit: "50",
      bounded: "1",
      viewbox: [rLon - dLon, rLat + dLat, rLon + dLon, rLat - dLat].map((n) => n.toFixed(4)).join(","),
      extratags: "1",
      addressdetails: "1"
    });

    const hospitals: HospitalResult[] = places
      .map((p) => {
        const hLat = Number(p.lat);
        const hLon = Number(p.lon);
        return {
          name: p.name || p.display_name.split(",")[0],
          lat: hLat,
          lon: hLon,
          distanceKm: Math.round(distanceKm(lat, lon, hLat, hLon) * 10) / 10,
          address: shortAddress(p.address),
          phone: p.extratags?.phone || p.extratags?.["contact:phone"] || null,
          emergency: p.extratags?.emergency === "yes",
          openNow: null,
          hours: p.extratags?.opening_hours ? [p.extratags.opening_hours] : null,
          // Google Maps shows the latest phone number and hours for this place.
          mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            [p.name || p.display_name.split(",")[0], shortAddress(p.address)].filter(Boolean).join(", ")
          )}`,
          source: "osm" as const
        };
      })
      .filter((h) => h.distanceKm <= radius)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 25);

    return Response.json({ hospitals, radius, kind, country, provider: "osm", fetchedAt: new Date().toISOString() });
  } catch {
    return Response.json({ error: "lookup_failed" }, { status: 502 });
  }
}
