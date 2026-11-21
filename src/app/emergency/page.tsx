import { headers } from "next/headers";
import { isGoogleEnabled } from "@/lib/places";
import HospitalMap from "../HospitalMap";
import EmergencyKit from "./EmergencyKit";
import PageHead from "../PageHead";
import { WarningSigns } from "../Tools";

export default async function EmergencyPage() {
  // On Vercel, this header says which country the visitor is in (used for emergency numbers).
  const country = (await headers()).get("x-vercel-ip-country") ?? undefined;
  return (
    <>
      <PageHead eyebrow="EMERGENCY INFORMATION" title={<>Getting help, <em>fast.</em></>} text="In an emergency, call your local emergency number straight away." />
      <EmergencyKit />
      <div className="section-wrap">
        <WarningSigns />
      </div>
      {/* The Google map key is meant for browsers (restricted to this site in Google Cloud). */}
      <HospitalMap googleMapsKey={isGoogleEnabled() ? process.env.GOOGLE_MAPS_BROWSER_KEY : undefined} initialCountry={country} />
    </>
  );
}
