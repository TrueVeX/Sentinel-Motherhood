// Sentinel Motherhood desktop app (Windows, macOS, Linux).
// A secure window onto the live app's start screen. Links that leave the app (Google sign-in,
// phone calls, WhatsApp, maps, other websites) open in the computer's normal browser or app.
const { app, BrowserWindow, shell } = require("electron");
const path = require("node:path");

const SITE = "https://sentinel-motherhood.vercel.app";
const START = `${SITE}/app`;

// Google and Apple don't allow sign-in inside app windows, so those go to the normal browser.
const OPEN_OUTSIDE = ["/api/auth/google", "/api/auth/apple"];

function opensOutside(url) {
  try {
    const u = new URL(url);
    if (u.protocol === "file:") return false;
    return u.origin !== SITE || OPEN_OUTSIDE.some((p) => u.pathname.startsWith(p));
  } catch {
    return true;
  }
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
    openExternal(url);
    return { action: "deny" };
  });

  // Links that leave the app open outside it.
  win.webContents.on("will-navigate", (event, url) => {
    if (opensOutside(url)) {
      event.preventDefault();
      openExternal(url);
    }
  });

  // No internet: show a friendly offline page with a retry button.
  win.webContents.on("did-fail-load", (_e, code, _desc, _url, isMainFrame) => {
    if (isMainFrame && code !== -3) win.loadFile(path.join(__dirname, "offline.html"));
  });

  win.on("closed", () => {
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
