import PageHead from "../../PageHead";
import { DueDateTracker } from "../../Tools";

export default function DueDatePage() {
  return (
    <>
      <PageHead eyebrow="TOOL" title={<>Due date &amp; <em>week tracker</em></>} crumbs={[{ href: "/tools", label: "Tools" }]} />
      <div className="section-wrap page-body narrow">
        <DueDateTracker />
      </div>
    </>
  );
}
