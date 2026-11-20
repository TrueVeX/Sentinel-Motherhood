import PageHead from "../../PageHead";
import { HospitalChecklist, PrintButton } from "../../Tools";

export default function ChecklistPage() {
  return (
    <>
      <PageHead eyebrow="TOOL" title={<>Hospital bag <em>checklist</em></>} crumbs={[{ href: "/tools", label: "Tools" }]} />
      <div className="section-wrap page-body narrow">
        <div className="page-actions"><PrintButton label="🖨 Print my checklist" /></div>
        <div id="print-area"><HospitalChecklist /></div>
      </div>
    </>
  );
}
