# Live hospital phone numbers from Google Maps

Without these keys, the Emergency page uses the free OpenStreetMap: some hospitals have phone
numbers and the rest get a "Find number on Google Maps" link.

With these keys, the Emergency page shows a **Google map** and, for every nearby hospital, the
**current phone number from Google Maps**, **"Open now / Closed now"** and **today's opening hours**,
with a **📞 Call** button. Numbers are fetched fresh from Google on every search (never stored),
so they are always up to date.

Google's terms only allow its place data on a Google map, so **both** keys are needed.

---

## 1. Turn on billing (required by Google, there is a free monthly allowance)

1. Go to **console.cloud.google.com** and select your **Sentinel Motherhood** project.
2. Menu ☰ → **Billing** → link a billing account (you add a card; Google gives a free monthly
   usage allowance, which is plenty for a science fair).
3. Optional but recommended: **Billing → Budgets & alerts → Create budget**, for example ₹500 / $5,
   so you get an email if usage ever grows.

## 2. Turn on the two APIs

Menu ☰ → **APIs & Services → Library**, then search and click **Enable** on:
- **Maps JavaScript API** (draws the map)
- **Places API (New)** (hospital phone numbers and hours)

## 3. Create the browser key (for the map)

1. **APIs & Services → Credentials → + Create credentials → API key**. Rename it `Sentinel map (browser)`.
2. **Application restrictions:** *Websites*, and add:
   - `https://sentinel-motherhood.vercel.app/*`
   - `http://localhost:3000/*`
3. **API restrictions:** *Restrict key* → tick only **Maps JavaScript API**. Save.

This key is visible to browsers by design; the website restriction stops anyone else from using it.

## 4. Create the server key (for phone numbers)

1. **+ Create credentials → API key** again. Rename it `Sentinel places (server)`.
2. **Application restrictions:** *None* (it's only used by the server, never shown to visitors).
3. **API restrictions:** *Restrict key* → tick only **Places API (New)**. Save.
4. Keep this key private.

## 5. Add them to Vercel

Vercel → **sentinel-motherhood** → **Settings → Environment Variables** (tick Production):

| Name | Value |
|---|---|
| `GOOGLE_MAPS_BROWSER_KEY` | the browser key from step 3 |
| `GOOGLE_PLACES_API_KEY` | the server key from step 4 |

Then redeploy. To test on the laptop too, add the same two lines to `.env.local`.

If either key is missing or wrong, the page automatically falls back to OpenStreetMap, so it never breaks.
