import { distanceKm, nominatim } from "@/lib/nominatim";

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

// GET /api/hospitals?lat=..&lon=..&radius=10  (radius in km)
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const lat = Number(params.get("lat"));
  const lon = Number(params.get("lon"));
  const radius = Math.min(50, Math.max(2, Number(params.get("radius")) || 10));
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    return Response.json({ error: "bad_location" }, { status: 400 });
  }

  // Round the location (~100 m) so nearby searches share the cache and exact positions aren't sent.
  const rLat = Math.round(lat * 1000) / 1000;
  const rLon = Math.round(lon * 1000) / 1000;
  const dLat = radius / 111;
  const dLon = radius / (111 * Math.max(0.1, Math.cos((rLat * Math.PI) / 180)));

  try {
    const places = await nominatim<Place[]>("/search", {
      amenity: "hospital",
      format: "jsonv2",
      limit: "50",
      bounded: "1",
      viewbox: [rLon - dLon, rLat + dLat, rLon + dLon, rLat - dLat].map((n) => n.toFixed(4)).join(","),
      extratags: "1",
      addressdetails: "1"
    });

    const hospitals = places
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
          emergency: p.extratags?.emergency === "yes"
        };
      })
      .filter((h) => h.distanceKm <= radius)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 25);

    return Response.json({ hospitals, radius });
  } catch {
    return Response.json({ error: "lookup_failed" }, { status: 502 });
  }
}
