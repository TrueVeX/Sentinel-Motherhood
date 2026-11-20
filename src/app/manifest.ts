import type { MetadataRoute } from "next";

// Makes the site installable as an app on Windows (Edge/Chrome) and Android (Chrome).
// The installed app opens on the simple start screen (/app), not the cinematic homepage.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/app",
    name: "Sentinel Motherhood",
    short_name: "Sentinel",
    description: "Guiding motherhood, nurturing generations. Pregnancy, birth and newborn care in one place.",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#F4F7F2",
    theme_color: "#123F46",
    categories: ["health", "lifestyle", "education"],
    icons: [
      { src: "/pwa-icon/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/512?maskable=1", sizes: "512x512", type: "image/png", purpose: "maskable" }
    ],
    shortcuts: [
      { name: "My dashboard", url: "/dashboard" },
      { name: "Ask the AI", url: "/ai-assistant" },
      { name: "Emergency help", url: "/emergency" }
    ]
  };
}
