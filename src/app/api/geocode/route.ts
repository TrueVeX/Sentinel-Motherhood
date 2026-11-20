import { nominatim } from "@/lib/nominatim";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/geocode?q=town or postcode  → the place's position, for when GPS isn't available.
export async function GET(request: Request) {
  const q = (new URL(request.url).searchParams.get("q") || "").trim().slice(0, 100);
  if (q.length < 2) return Response.json({ error: "bad_query" }, { status: 400 });
  try {
    const results = await nominatim<{ display_name: string; lat: string; lon: string }[]>("/search", {
      q,
      format: "jsonv2",
      limit: "1"
    });
    if (!results.length) return Response.json({ error: "not_found" }, { status: 404 });
    const [r] = results;
    return Response.json({ name: r.display_name, lat: Number(r.lat), lon: Number(r.lon) });
  } catch {
    return Response.json({ error: "lookup_failed" }, { status: 502 });
  }
}
