import Link from "next/link";

export default function PageHead({
  eyebrow,
  title,
  text,
  crumbs
}: {
  eyebrow: string;
  title: React.ReactNode;
  text?: string;
  crumbs?: { href: string; label: string }[];
}) {
  return (
    <section className="page-head section-wrap">
      {crumbs && (
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          {crumbs.map((c) => (
            <span key={c.href}> / <Link href={c.href}>{c.label}</Link></span>
          ))}
        </nav>
      )}
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      {text && <p>{text}</p>}
    </section>
  );
}

export function ArticleList({ articles }: { articles: { slug: string; title: string; summary: string; body: string[] }[] }) {
  return (
    <div className="article-layout section-wrap">
      <aside className="article-toc" aria-label="On this page">
        <strong>On this page</strong>
        {articles.map((a) => <a key={a.slug} href={`#${a.slug}`}>{a.title}</a>)}
      </aside>
      <div className="article-list">
        {articles.map((a) => (
          <article key={a.slug} id={a.slug} className="article-card">
            <h2>{a.title}</h2>
            <p className="article-summary">{a.summary}</p>
            {a.body.map((p, i) => <p key={i}>{p}</p>)}
            <Link className="text-link" href={`/ai-assistant?q=${encodeURIComponent(`Tell me more about ${a.title.toLowerCase()}`)}`}>
              Ask the AI assistant about this <span>↗</span>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
