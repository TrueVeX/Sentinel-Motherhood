import { distanceKm } from "./nominatim";

/**
 * Live hospital details from Google Maps (Places API, New): phone numbers, "open now" and
 * opening hours. Asked fresh on every search (no caching), so numbers are always current.
 *
 * Google's terms only allow this data to be shown on a Google map, so it is used only when the
 * Google map key is set too (see isGoogleEnabled).
 */

export type HospitalResult = {
  name: string;
  lat: number;
  lon: number;
  distanceKm: number;
  address: string;
  phone: string | null; // as shown, e.g. "+91 40 1234 5678"
  emergency: boolean;
  openNow: boolean | null;
  hours: string[] | null; // Monday … Sunday, e.g. "Monday: Open 24 hours"
  mapsUrl: string | null;
  source: "google" | "osm";
};

export function isGoogleEnabled() {
  return !!(process.env.GOOGLE_PLACES_API_KEY && process.env.GOOGLE_MAPS_BROWSER_KEY);
}

type Place = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  shortFormattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  currentOpeningHours?: { openNow?: boolean };
  regularOpeningHours?: { openNow?: boolean; weekdayDescriptions?: string[] };
  googleMapsUri?: string;
  businessStatus?: string;
};

const FIELDS = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.shortFormattedAddress",
  "places.location",
  "places.nationalPhoneNumber",
  "places.internationalPhoneNumber",
  "places.currentOpeningHours.openNow",
  "places.regularOpeningHours",
  "places.googleMapsUri",
  "places.businessStatus"
].join(",");

/** Google place types for each kind of place on the map. */
export const GOOGLE_TYPES: Record<string, string[]> = { hospital: ["hospital"], pharmacy: ["pharmacy"], clinic: ["doctor"] };

export async function googleHospitals(lat: number, lon: number, radiusKm: number, kind = "hospital"): Promise<HospitalResult[]> {
  const res = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY!,
      "X-Goog-FieldMask": FIELDS
    },
    body: JSON.stringify({
      includedTypes: GOOGLE_TYPES[kind] ?? ["hospital"],
      maxResultCount: 20,
      rankPreference: "DISTANCE",
      locationRestriction: {
        circle: { center: { latitude: lat, longitude: lon }, radius: Math.min(50000, radiusKm * 1000) }
      }
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(15000)
  });
  const data = (await res.json().catch(() => ({}))) as { places?: Place[]; error?: { message?: string } };
  if (!res.ok) throw new Error(`Google Places ${res.status}: ${data.error?.message ?? "request failed"}`);

  return (data.places ?? [])
    .filter((p) => p.location?.latitude !== undefined && p.location?.longitude !== undefined)
    .filter((p) => p.businessStatus !== "CLOSED_PERMANENTLY")
    .map((p) => {
      const hLat = p.location!.latitude!;
      const hLon = p.location!.longitude!;
      return {
        name: p.displayName?.text || "Hospital",
        lat: hLat,
        lon: hLon,
        distanceKm: Math.round(distanceKm(lat, lon, hLat, hLon) * 10) / 10,
        address: p.shortFormattedAddress || p.formattedAddress || "",
        phone: p.internationalPhoneNumber || p.nationalPhoneNumber || null,
        emergency: /emergency|casualty|trauma/i.test(p.displayName?.text ?? ""),
        openNow: p.currentOpeningHours?.openNow ?? p.regularOpeningHours?.openNow ?? null,
        hours: p.regularOpeningHours?.weekdayDescriptions ?? null,
        mapsUrl: p.googleMapsUri ?? null,
        source: "google" as const
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
