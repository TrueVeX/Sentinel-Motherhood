import Link from "next/link";

export default function NotFound() {
  return (
    <section className="not-found section-wrap">
      <span className="nf-mark">404</span>
      <h1>We couldn’t find <em>that page.</em></h1>
      <p>The link may be broken, or the page may have moved.</p>
      <form className="big-search" action="/search" role="search">
        <input name="q" placeholder="Search Sentinel" aria-label="Search" maxLength={80} />
        <button type="submit">Search</button>
      </form>
      <div className="nf-links">
        <Link className="button button-primary" href="/">Go to the homepage <span>→</span></Link>
        <Link className="text-link" href="/dashboard">My dashboard</Link>
        <Link className="text-link" href="/emergency">Emergency help</Link>
      </div>
    </section>
  );
}
