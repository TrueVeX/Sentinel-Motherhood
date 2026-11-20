import os from "node:os";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Finds this laptop's Wi-Fi/LAN addresses so phones on the same network can open the app.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const port = url.port || (url.protocol === "https:" ? "443" : "80");
  // Wi-Fi first, virtual adapters (VirtualBox, VMware, WSL, Docker) last.
  const score = (name: string, address: string) =>
    /wi-?fi|wlan|wireless/i.test(name) ? 0
    : /virtual|vbox|vmware|vethernet|wsl|docker|hyper-v/i.test(name) || address.startsWith("192.168.56.") ? 2
    : 1;
  const addresses = Object.entries(os.networkInterfaces())
    .flatMap(([name, list]) => (list ?? []).map((i) => ({ name, ...i })))
    .filter((i) => i.family === "IPv4" && !i.internal)
    .sort((a, b) => score(a.name, a.address) - score(b.name, b.address))
    .map((i) => `${url.protocol}//${i.address}:${port}`);
  return Response.json({ urls: addresses }, { headers: { "Cache-Control": "no-store" } });
}
