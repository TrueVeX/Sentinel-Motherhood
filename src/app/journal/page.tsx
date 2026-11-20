import { requireUser } from "@/lib/auth";
import { journalFor } from "@/lib/records";
import PageHead from "../PageHead";
import JournalEditor from "./JournalEditor";

export default async function JournalPage() {
  const user = await requireUser();
  const entries = await journalFor(user.id);

  return (
    <>
      <PageHead eyebrow="PERSONAL PREGNANCY JOURNAL" title={<>Your thoughts, <em>kept safe.</em></>} text="Only you can see your journal. Write about your day, your feelings or the little moments." />
      <div className="section-wrap page-body">
        <JournalEditor entries={entries.map(({ id, title, body, mood, createdAt }) => ({ id, title, body, mood, createdAt }))} />
      </div>
    </>
  );
}
