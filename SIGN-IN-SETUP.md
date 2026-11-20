# Setting up "Continue with Google" and "Continue with Apple"

The buttons are built into the login and sign-up pages. They start working once you add the keys below.
While the site runs on your laptop (`npm run dev`) the buttons always show; online they only show
once their keys are added.

In the steps below, replace `YOUR-SITE` with your real address, for example
`https://sentinel-motherhood.vercel.app`, and also set `APP_URL` to that address.

---

## Google (free)

1. Go to **console.cloud.google.com** and create a project (for example "Sentinel Motherhood").
2. Open **APIs & Services → OAuth consent screen**. Choose **External**, fill in the app name,
   your email and the support email, then save. Add yourself as a test user while testing.
3. Open **APIs & Services → Credentials → Create credentials → OAuth client ID**.
   - Application type: **Web application**
   - **Authorised redirect URIs** — add both:
     - `http://localhost:3000/api/auth/google/callback`
     - `https://YOUR-SITE/api/auth/google/callback`
4. Copy the **Client ID** and **Client secret** into:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

Google sign-in works on `http://localhost:3000` too, so you can test it on your laptop.

---

## Apple (needs a paid Apple Developer account, $99/year)

Apple only allows **https** addresses that you own, so Sign in with Apple can't be tested on
`localhost`. Test it on the deployed site.

1. Join the **Apple Developer Program** at developer.apple.com.
2. **Certificates, Identifiers & Profiles → Identifiers → App IDs**: create an App ID and tick
   **Sign in with Apple**.
3. **Identifiers → Services IDs**: create one (for example `com.yourname.sentinel.web`). This is your
   `APPLE_CLIENT_ID`. Tick **Sign in with Apple → Configure**:
   - Primary App ID: the App ID from step 2
   - Domains: `YOUR-SITE` without `https://`
   - Return URLs: `https://YOUR-SITE/api/auth/apple/callback`
4. **Keys**: create a key with **Sign in with Apple** ticked and download the `.p8` file
   (you can only download it once). Note its **Key ID**.
5. Your **Team ID** is shown at the top right of the developer site.
6. Add:
   - `APPLE_CLIENT_ID` = the Services ID
   - `APPLE_TEAM_ID` = your Team ID
   - `APPLE_KEY_ID` = the Key ID
   - `APPLE_PRIVATE_KEY` = the whole contents of the `.p8` file, including the
     `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines

---

## How accounts work with Google and Apple

- First time: a new Sentinel account is created and the person goes to onboarding.
- If someone already has a Sentinel account with the **same, verified email**, Google/Apple sign-in
  is linked to that account.
- Apple may hide the real email (a "privaterelay" address). That's fine — it still works.
- Accounts made this way have no password; they can set one later in **Settings**.
- New Google/Apple accounts start as "mother" accounts. The admin can change roles on the Admin page.
