import { NEWBORN_CARE } from "@/lib/content";
import PageHead, { ArticleList } from "../PageHead";

export default function NewbornCarePage() {
  return (
    <>
      <PageHead eyebrow="NEWBORN CARE" title={<>The first weeks, <em>made simpler.</em></>} text="Feeding, sleep, bathing and knowing when to ask for help." />
      <ArticleList articles={NEWBORN_CARE} />
    </>
  );
}
