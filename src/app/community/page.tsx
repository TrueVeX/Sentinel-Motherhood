import { requireUser } from "@/lib/auth";
import { listPosts } from "@/lib/records";
import PageHead from "../PageHead";
import { DeletePostButton, NewPostForm, ReplyForm } from "./CommunityForms";

const ROLE_BADGE: Record<string, string> = { professional: "Healthcare professional", admin: "Admin" };

function when(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export default async function CommunityPage() {
  const user = await requireUser();
  const posts = await listPosts();

  return (
    <>
      <PageHead eyebrow="MOTHERHOOD COMMUNITY" title={<>You’re <em>not alone.</em></>} text="Ask questions, share experiences and support each other. Be kind, and never share private medical details." />
      <div className="section-wrap page-body community-layout">
        <NewPostForm />
        <div className="post-list">
          {posts.length === 0 && <p className="dash-empty">No posts yet. Be the first to say hello!</p>}
          {posts.map((p) => (
            <article key={p.id} id={`post-${p.id}`} className="post-card">
              <header>
                <span className="avatar">{p.authorName.slice(0, 1).toUpperCase()}</span>
                <span>
                  <strong>{p.authorName}</strong>
                  {ROLE_BADGE[p.authorRole] && <em className="role-badge">{ROLE_BADGE[p.authorRole]}</em>}
                  <small>{when(p.createdAt)}</small>
                </span>
                {(p.userId === user.id || user.role === "admin") && <DeletePostButton postId={p.id} />}
              </header>
              <h2>{p.title}</h2>
              <p>{p.body}</p>
              <div className="replies">
                {p.replies.map((r) => (
                  <div key={r.id} className="reply">
                    <strong>{r.authorName}</strong>
                    {ROLE_BADGE[r.authorRole] && <em className="role-badge">{ROLE_BADGE[r.authorRole]}</em>}
                    <small>{when(r.createdAt)}</small>
                    <p>{r.body}</p>
                  </div>
                ))}
                <ReplyForm postId={p.id} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
