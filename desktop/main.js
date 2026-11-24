// Sentinel Motherhood desktop app (Windows, macOS, Linux).
// A secure window onto the live app's start screen. Links that leave the app (Google sign-in,
// phone calls, WhatsApp, maps, other websites) open in the computer's normal browser or app.
const { app, BrowserWindow, net, shell } = require("electron");
const crypto = require("node:crypto");
const path = require("node:path");

const SITE = "https://sentinel-motherhood.vercel.app";
const START = `${SITE}/app`;

// Google and Apple don't allow sign-in inside app windows. Those buttons open the normal browser,
// and the app waits until the browser hands the sign-in back (see src/lib/app-signin.ts on the site).
const SIGN_IN = /^\/api\/auth\/(google|apple)\/start$/;

function opensOutside(url) {
  try {
    const u = new URL(url);
    if (u.protocol === "file:") return false;
    return u.origin !== SITE;
  } catch {
    return true;
  }
}

function signInLink(url) {
  try {
    const u = new URL(url);
    return u.origin === SITE && SIGN_IN.test(u.pathname) ? u : null;
  } catch {
    return null;
  }
}

let waiting = null; // the sign-in the app is waiting for: { id, timer }

function stopWaiting() {
  if (waiting) clearInterval(waiting.timer);
  waiting = null;
}

function signInThroughBrowser(link) {
  stopWaiting();
  const id = crypto.randomBytes(32).toString("hex"); // secret, only this app knows it
  const code = String(crypto.randomInt(0, 1000000)).padStart(6, "0"); // shown here and in the browser
  const outside = new URL(link);
  outside.searchParams.set("app", id);
  outside.searchParams.set("appcode", code);
  shell.openExternal(outside.toString());

  const provider = link.pathname.includes("apple") ? "Apple" : "Google";
  win.loadFile(path.join(__dirname, "signin.html"), { query: { code, provider, retry: link.toString() } });

  const started = Date.now();
  const timer = setInterval(async () => {
    if (Date.now() - started > 10 * 60 * 1000) return stopWaiting();
    try {
      const res = await net.fetch(`${SITE}/api/auth/app/status?id=${id}`, { cache: "no-store" });
      const { status } = await res.json();
      if (status === "ready" && waiting && waiting.id === id) {
        stopWaiting();
        if (!win) return;
        win.loadURL(`${SITE}/api/auth/app/finish?id=${id}`);
        if (win.isMinimized()) win.restore();
        win.show();
        win.focus();
      } else if (status === "gone" && Date.now() - started > 15000) {
        stopWaiting();
      }
    } catch {
      /* offline for a moment: try again next time */
    }
  }, 2000);
  waiting = { id, timer };
}

function openExternal(url) {
  // Only hand safe kinds of links to the operating system.
  if (/^(https?|mailto|tel|sms|whatsapp):/i.test(url)) shell.openExternal(url);
}

let win = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 820,
    minWidth: 380,
    minHeight: 600,
    title: "Sentinel Motherhood",
    backgroundColor: "#F4F7F2",
    icon: path.join(__dirname, "build", "icon.png"),
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, sandbox: true, nodeIntegration: false }
  });

  win.loadURL(START);

  // New windows (target=_blank links) open in the normal browser.
  win.webContents.setWindowOpenHandler(({ url }) => {
    const link = signInLink(url);
    if (link) signInThroughBrowser(link);
    else openExternal(url);
    return { action: "deny" };
  });

  // Links that leave the app open outside it.
  win.webContents.on("will-navigate", (event, url) => {
    const link = signInLink(url);
    if (link) {
      event.preventDefault();
      signInThroughBrowser(link);
    } else if (opensOutside(url)) {
      event.preventDefault();
      openExternal(url);
    }
  });

  // Leaving the "finish in your browser" screen (for example Cancel) stops waiting.
  win.webContents.on("did-navigate", (_e, url) => {
    if (!url.startsWith("file:")) stopWaiting();
  });

  // No internet: show a friendly offline page with a retry button.
  win.webContents.on("did-fail-load", (_e, code, _desc, _url, isMainFrame) => {
    if (isMainFrame && code !== -3) win.loadFile(path.join(__dirname, "offline.html"));
  });

  win.on("closed", () => {
    stopWaiting();
    win = null;
  });
}

// Only one copy of the app at a time; a second launch focuses the first.
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });
  app.whenReady().then(() => {
    createWindow();
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });
}
