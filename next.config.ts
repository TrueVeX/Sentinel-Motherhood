import type { NextConfig } from "next";

// Short, friendly links (for posters and QR codes) that redirect to the real pages.
const shortcuts: Record<string, string> = {
  "/home": "/",
  "/chat": "/ai-assistant",
  "/ask": "/ai-assistant",
  "/ai": "/ai-assistant",
  "/journey": "/#journey",
  "/stages": "/#journey",
  "/baby": "/baby-development",
  "/development": "/baby-development",
  "/mother": "/mother-care",
  "/wellness": "/mother-care",
  "/baby-care": "/newborn-care",
  "/newborn": "/newborn-care",
  "/tracker": "/tools/due-date",
  "/due-date": "/tools/due-date",
  "/checklist": "/tools/hospital-checklist",
  "/names": "/tools/baby-names",
  "/help": "/emergency",
  "/sos": "/emergency",
  "/hospitals": "/emergency#hospitals",
  "/map": "/emergency#hospitals",
  "/fair": "/about#visit",
  "/poll": "/about#poll",
  "/vote": "/about#poll",
  "/qr": "/about#visit",
  "/stats": "/about#visit",
  "/register": "/signup",
  "/sign-up": "/signup",
  "/signin": "/login",
  "/sign-in": "/login",
  "/account": "/profile",
  "/diary": "/journal",
  "/forum": "/community"
};

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return Object.entries(shortcuts).map(([source, destination]) => ({ source, destination, permanent: false }));
  }
};

export default nextConfig;
