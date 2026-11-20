import { MOTHER_CARE } from "@/lib/content";
import PageHead, { ArticleList } from "../PageHead";

export default function MotherCarePage() {
  return (
    <>
      <PageHead eyebrow="MATERNAL WELLNESS" title={<>Caring for <em>you, too.</em></>} text="Looking after yourself is part of looking after your baby." />
      <ArticleList articles={MOTHER_CARE} />
    </>
  );
}
