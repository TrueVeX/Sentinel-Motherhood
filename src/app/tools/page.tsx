import Link from "next/link";
import { TOOLS } from "@/lib/content";
import PageHead from "../PageHead";

export default function ToolsPage() {
  return (
    <>
      <PageHead eyebrow="PREGNANCY TOOLS HUB" title={<>Little helpers for <em>big days.</em></>} text="Simple tools to help you plan ahead." />
      <div className="section-wrap page-body">
        <div className="hub-grid">
          {TOOLS.map((t) => (
            <Link key={t.href} href={t.href} className="hub-card">
              <span className="stage-icon">{t.icon}</span>
              <h2>{t.title}</h2>
              <p>{t.text}</p>
              <span className="card-arrow">Open <b>→</b></span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
