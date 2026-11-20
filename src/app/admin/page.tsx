import { listUsers, requireRole } from "@/lib/auth";
import { listContactMessages, listPosts } from "@/lib/records";
import { read } from "@/lib/store";
import PageHead from "../PageHead";
import { DeleteMessageButton, ResetButton, RoleSelect } from "./AdminControls";

export default async function AdminPage() {
  const admin = await requireRole("admin");
  const [users, posts, messages, poll, stats] = await Promise.all([
    listUsers(),
    listPosts(),
    listContactMessages(),
    read("poll", { yes: 0, maybe: 0, no: 0 }),
    read("stats", { visits: 0, questions: 0, aiAnswers: 0, offlineAnswers: 0 })
  ]);

  const tiles = [
    { label: "Members", value: users.length },
    { label: "Community posts", value: posts.length },
    { label: "Messages", value: messages.length },
    { label: "Visits", value: stats.visits },
    { label: "AI questions", value: stats.questions },
    { label: "Poll votes", value: poll.yes + poll.maybe + poll.no }
  ];

  return (
    <>
      <PageHead eyebrow="ADMIN DASHBOARD" title={<>Site <em>overview</em></>} text={`Signed in as ${admin.name} (admin).`} />
      <div className="section-wrap page-body">
        <div className="tile-row">
          {tiles.map((t) => <div key={t.label} className="tile"><strong>{t.value}</strong><small>{t.label}</small></div>)}
        </div>

        <h2 className="block-title">Members</h2>
        <div className="table-wrap">
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Email</th><th>Journey</th><th>Joined</th><th>Role</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.journey ?? "–"}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>{u.id === admin.id ? "admin (you)" : <RoleSelect userId={u.id} role={u.role} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="block-title">Contact messages</h2>
        {messages.length ? (
          <ul className="message-list">
            {messages.map((m) => (
              <li key={m.id}>
                <div>
                  <strong>{m.name}</strong> <small>{m.email} · {new Date(m.createdAt).toLocaleString()}</small>
                  <p>{m.message}</p>
                </div>
                <DeleteMessageButton id={m.id} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="dash-empty">No messages yet.</p>
        )}

        <h2 className="block-title">Science fair data</h2>
        <p className="block-note">Poll: {poll.yes} yes · {poll.maybe} maybe · {poll.no} not really. Community posts can be removed from the community page.</p>
        <div className="form-buttons start">
          <ResetButton what="poll" />
          <ResetButton what="stats" />
        </div>
      </div>
    </>
  );
}
