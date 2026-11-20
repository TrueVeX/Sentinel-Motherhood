import Link from "next/link";
import { search } from "@/lib/content";
import PageHead from "../PageHead";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.slice(0, 80) : "";
  const results = search(query);

  return (
    <>
      <PageHead eyebrow="SEARCH" title={query ? <>Results for <em>“{query}”</em></> : "Search"} />
      <div className="section-wrap page-body narrow">
        <form className="big-search" action="/search" role="search">
          <input name="q" defaultValue={query} placeholder="Try “week 20”, “sleep” or “hospital bag”" aria-label="Search" maxLength={80} />
          <button type="submit">Search</button>
        </form>
        {query && !results.length && (
          <p className="block-note">
            No results. Try a different word, or <Link href={`/ai-assistant?q=${encodeURIComponent(query)}`}>ask the AI assistant</Link>.
          </p>
        )}
        <ul className="result-list">
          {results.map((r) => (
            <li key={r.href}>
              <Link href={r.href}>
                <small>{r.type}</small>
                <strong>{r.title}</strong>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
