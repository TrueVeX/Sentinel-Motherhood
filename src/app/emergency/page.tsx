import HospitalMap from "../HospitalMap";
import PageHead from "../PageHead";
import { WarningSigns } from "../Tools";

export default function EmergencyPage() {
  return (
    <>
      <PageHead eyebrow="EMERGENCY INFORMATION" title={<>Getting help, <em>fast.</em></>} text="In an emergency, call your local emergency number straight away." />
      <div className="section-wrap">
        <WarningSigns />
      </div>
      <HospitalMap />
    </>
  );
}
