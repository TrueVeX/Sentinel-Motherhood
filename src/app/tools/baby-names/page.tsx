import PageHead from "../../PageHead";
import BabyNames from "./BabyNames";

export default function BabyNamesPage() {
  return (
    <>
      <PageHead
        eyebrow="TOOL"
        title={<>Baby name <em>explorer</em></>}
        text="Browse, filter and save your favourites. Favourites stay on this device."
        crumbs={[{ href: "/tools", label: "Tools" }]}
      />
      <div className="section-wrap page-body">
        <BabyNames />
      </div>
    </>
  );
}
