import Chat from "../Chat";
import PageHead from "../PageHead";

export default async function AiAssistantPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const question = typeof q === "string" ? q.slice(0, 300) : "";
  return (
    <>
      <PageHead eyebrow="AI ASSISTANT" title={<>Ask <em>Sentinel.</em></>} text="Type or speak a question about pregnancy, birth or caring for a newborn." />
      <Chat prefill={question ? { text: question, id: 1 } : null} />
    </>
  );
}
