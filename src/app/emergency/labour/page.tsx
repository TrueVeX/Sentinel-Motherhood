import PageHead from "../../PageHead";
import LabourMode from "./LabourMode";

export const metadata = { title: "Labour mode | Sentinel Motherhood" };

export default function LabourPage() {
  return (
    <>
      <PageHead eyebrow="EMERGENCY KIT" title={<>⏱ Labour <em>mode</em></>} crumbs={[{ href: "/emergency", label: "Emergency" }]} />
      <div className="section-wrap page-body narrow">
        <LabourMode />
      </div>
    </>
  );
}
