import { ImageResponse } from "next/og";

// App icons for the installed app: /pwa-icon/192, /pwa-icon/512, and /pwa-icon/512?maskable=1
// (maskable = extra padding so Android can crop it into a circle or squircle safely).
export async function GET(request: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size: raw } = await params;
  const size = raw === "192" ? 192 : 512;
  const maskable = new URL(request.url).searchParams.has("maskable");
  const mark = Math.round(size * (maskable ? 0.56 : 0.74));

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#123F46" }}>
        <svg width={mark} height={mark} viewBox="0 0 48 48">
          <path d="M24 4.5 40 10v11.2c0 10.1-6.6 17.7-16 22.3C14.6 38.9 8 31.3 8 21.2V10L24 4.5Z" fill="none" stroke="#F4F7F2" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17.1 20.8c0-3.2 2.2-5.4 5-5.4 1.1 0 2.2.5 2.9 1.4.8-.9 1.9-1.4 3-1.4 2.7 0 4.9 2.2 4.9 5.4 0 4.2-5.2 8-7.9 10-2.7-2-7.9-5.8-7.9-10Z" fill="#A8CFC3" />
          <path d="M14.5 34.2c2.8-2.8 5.9-4.2 9.5-4.2s6.7 1.4 9.5 4.2" fill="none" stroke="#F4F7F2" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </div>
    ),
    { width: size, height: size, headers: { "Cache-Control": "public, max-age=86400" } }
  );
}
