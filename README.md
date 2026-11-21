# Sentinel Motherhood

**Guiding motherhood, nurturing generations.**

A web app that walks mothers and their families through pregnancy, birth and the first months with a newborn — with week-by-week guidance, practical tools, an AI assistant, a private journal and a supportive community.

Made by **Revoori Krithika Reddy** as a science fair project.

🌐 **Live site:** https://sentinel-motherhood.vercel.app
⬇️ **Download the app:** https://sentinel-motherhood-download.vercel.app (Android, Windows, macOS, Linux, and iPhone via Safari → Add to Home Screen)

> Sentinel gives general information only. It is not a substitute for a doctor or midwife. In an emergency, call your local emergency number.

---

## Features

**Homepage**
- Cinematic, scroll-driven sunrise scene: mist clears, the sun rises, the mother and baby appear
- A sliding reel of the six stages of motherhood and a 40-week journey path that draws itself as you scroll
- Due-date countdown and a choice of three journeys

**Guidance**
- Pregnancy weeks 1–40: baby's size, development and what you might notice
- Baby development milestones, Mother Care and Baby Care articles
- Site-wide search

**Tools**
- Due-date and pregnancy-week tracker
- Hospital bag checklist (printable)
- Baby name explorer with favourites
- Nearby hospitals map using GPS or a town search (OpenStreetMap)
- Emergency warning signs

**Accounts**
- Sign up with email, **Google** or **Apple**
- Onboarding: set up a profile, then choose a journey — **Pregnancy**, **Birth** or **Motherhood**
- A personal dashboard for each journey, plus dashboards for healthcare professionals and the admin
- Private journal (warns before leaving unsaved writing), appointments, notifications and a community forum
- The first account to sign up becomes the admin

**AI assistant**
- Ask questions by typing or speaking; answers can be read aloud
- Uses free AI models through OpenRouter (or NVIDIA), with built-in offline answers as a fallback

**Science fair extras**
- QR code so visitors can open the site on their phones
- Live visitor poll and live stats
- Kiosk mode that cycles through the pages on its own

**Also**
- Installable app (PWA) with its own simple start screen and an offline page
- Click animations, responsive layout from phones to wide screens, and support for "reduce motion"

---

## Built with

| | |
|---|---|
| Framework | [Next.js 15](https://nextjs.org) (App Router) with React 19 and TypeScript |
| Styling | Plain CSS — palette: deep teal `#123F46`, teal `#247C78`, mint `#A8CFC3`, ivory `#F4F7F2` |
| Fonts | Playfair Display and DM Sans |
| Database | [Upstash Redis](https://upstash.com) online; local JSON files during development |
| Sign-in | Custom email/password sessions + Google and Apple (OpenID Connect with PKCE) |
| AI | OpenRouter or NVIDIA (OpenAI-compatible chat API) |
| Maps | Leaflet + OpenStreetMap |
| Hosting | [Vercel](https://vercel.com) |

---

## Run it on your computer

**Requirements:** Node.js 20 or later, and npm.

```bash
git clone https://github.com/TrueVeX/Sentinel-Motherhood.git
cd Sentinel-Motherhood
npm install
```

Create a file called `.env.local` (copy the names from [`.env.example`](.env.example)) and add an AI key if you have one. Everything else is optional on your computer.

```bash
npm run dev
```

Open http://localhost:3000.

Without a database configured, accounts, journals and votes are saved as files in a local `.data` folder (never uploaded).

---

## Settings (environment variables)

All settings are listed in [`.env.example`](.env.example). Never commit real values.

| Name | Needed for |
|---|---|
| `NVIDIA_API_KEY` (or `OPENROUTER_API_KEY` / `API_KEY`) | AI assistant. An OpenRouter key (`sk-or-…`) or an NVIDIA key (`nvapi-…`) |
| `AI_MODEL` | Optional: choose a specific AI model |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Online database (set automatically when Upstash Redis is added through the Vercel Marketplace) |
| `APP_URL` | The site's public address, used for sign-in return links |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Sign in with Google |
| `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY` | Sign in with Apple |

Step-by-step setup for Google and Apple sign-in: [SIGN-IN-SETUP.md](SIGN-IN-SETUP.md).

---

## Desktop and Android apps

- `desktop/` is the Electron app for Windows, macOS and Linux. Pushing a tag like `v1.2.0` runs `.github/workflows/release.yml`, which builds all three on GitHub and attaches them to a Release.
- The Android APK is a Trusted Web Activity built with Bubblewrap and uploaded to the same Release.
- `download-site/` is the download page, hosted on Vercel at https://sentinel-motherhood-download.vercel.app (deploy it with `vercel deploy --prod` from that folder).

## Project layout

```
src/
  app/
    page.tsx, HomeClient.tsx, home/   Cinematic homepage (sunrise, stage reel, 40-week path)
    app/                              Simple start screen for the installed app
    pregnancy/, baby-development/,
    mother-care/, newborn-care/       Guidance pages
    tools/                            Due-date tracker, hospital checklist, baby names
    emergency/                        Warning signs + nearby hospitals map
    ai-assistant/, Chat.tsx           AI assistant
    login/, signup/, onboarding/      Accounts and setup
    dashboard/                        Journey and role dashboards
    journal/, community/,
    appointments/, notifications/     Signed-in features
    profile/, settings/, admin/       Account and site management
    api/                              Server routes: chat, auth, hospitals, poll, stats…
    actions/                          Server actions used by forms
    Header.tsx, layout.tsx            Shared header, footer and page frame
    ClickEffects.tsx, AppMode.tsx     Click animations and installed-app behaviour
    manifest.ts, icon.svg             App manifest and icons
  lib/
    auth.ts, oauth.ts                 Accounts, sessions, Google/Apple sign-in
    store.ts                          Database (Upstash Redis or local files)
    records.ts, notify.ts             Journal, posts, appointments, notifications
    content.ts                        Pregnancy weeks, articles, baby names, search
    motion.ts                         Scroll-animation helpers
  middleware.ts                       Sends signed-out visitors to login
public/                               Service worker and offline page
```

---

## Deploying

The site is deployed on Vercel:

```bash
vercel deploy --prod
```

Add the settings above in **Vercel → Project → Settings → Environment Variables**, and add Upstash Redis from the Vercel Marketplace so accounts and data are saved online.

---

## Privacy and safety

- Passwords are stored only as salted scrypt hashes; sessions use random tokens in private cookies.
- Journals and appointments are visible only to their owner.
- The hospitals map rounds your location before looking up hospitals.
- Secret keys live only in environment variables and are never committed.

---

## License

Released under the [MIT License](LICENSE) — copyright © 2026 TrueVeX. Created by Revoori Krithika Reddy.
