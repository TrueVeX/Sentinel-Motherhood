import PageHead from "../../PageHead";
import MedicalCardView from "./MedicalCardView";

export const metadata = { title: "My medical card | Sentinel Motherhood" };

export default function MedicalCardPage() {
  return (
    <>
      <PageHead eyebrow="EMERGENCY KIT" title={<>🪪 Medical <em>card</em></>} crumbs={[{ href: "/emergency", label: "Emergency" }]} />
      <div className="section-wrap page-body narrow">
        <MedicalCardView />
      </div>
    </>
  );
}
