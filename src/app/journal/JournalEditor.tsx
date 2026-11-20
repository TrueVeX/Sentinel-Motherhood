"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { removeJournal, saveJournal } from "../actions/records";

type Entry = { id: string; title: string; body: string; mood: string; createdAt: string };
const MOODS = ["😊", "😌", "😴", "😟", "😢", "🥰"];
const blank = { id: "", title: "", body: "", mood: "😊" };

export default function JournalEditor({ entries }: { entries: Entry[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState(blank);
  const [saved, setSaved] = useState(blank);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const dirty = draft.title !== saved.title || draft.body !== saved.body || draft.mood !== saved.mood;
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  // Ask before leaving with unsaved changes: closing the tab, or clicking a link in the site.
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    const onClick = (e: MouseEvent) => {
      if (!dirtyRef.current) return;
      const link = (e.target as HTMLElement).closest("a[href]");
      if (!link || link.getAttribute("target") === "_blank") return;
      if (!window.confirm("You have an unsaved journal entry. Leave without saving?")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  function confirmDiscard() {
    return !dirty || window.confirm("Discard your unsaved changes?");
  }

  function open(entry: Entry) {
    if (!confirmDiscard()) return;
    const next = { id: entry.id, title: entry.title, body: entry.body, mood: entry.mood };
    setDraft(next);
    setSaved(next);
    setMessage("");
  }

  function startNew() {
    if (!confirmDiscard()) return;
    setDraft(blank);
    setSaved(blank);
    setMessage("");
  }

  function save() {
    startTransition(async () => {
      const result = await saveJournal({ id: draft.id || undefined, title: draft.title, body: draft.body, mood: draft.mood });
      if ("error" in result) {
        setMessage(result.error ?? "Couldn’t save.");
        return;
      }
      const next = { ...draft, id: result.id ?? draft.id, title: draft.title.trim() || "Untitled entry" };
      setDraft(next);
      setSaved(next);
      setMessage("Saved ✓");
      router.refresh();
    });
  }

  function remove(entry: Entry) {
    if (!window.confirm(`Delete “${entry.title}”? This can’t be undone.`)) return;
    startTransition(async () => {
      await removeJournal(entry.id);
      if (draft.id === entry.id) {
        setDraft(blank);
        setSaved(blank);
      }
      router.refresh();
    });
  }

  return (
    <div className="journal-layout">
      <aside className="journal-list">
        <button type="button" className="button button-primary" onClick={startNew}>＋ New entry</button>
        {entries.length === 0 && <p className="dash-empty">No entries yet. Your first one will appear here.</p>}
        <ul>
          {entries.map((e) => (
            <li key={e.id} className={draft.id === e.id ? "current" : ""}>
              <button type="button" onClick={() => open(e)}>
                <span>{e.mood}</span>
                <span>
                  <strong>{e.title}</strong>
                  <small>{new Date(e.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</small>
                </span>
              </button>
              <button type="button" className="remove" onClick={() => remove(e)} aria-label={`Delete ${e.title}`}>×</button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="journal-editor form-card wide">
        <div className="mood-row" role="radiogroup" aria-label="Mood">
          {MOODS.map((m) => (
            <button type="button" key={m} role="radio" aria-checked={draft.mood === m} className={draft.mood === m ? "active" : ""} onClick={() => setDraft({ ...draft, mood: m })}>{m}</button>
          ))}
        </div>
        <input className="journal-title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Title (optional)" maxLength={120} aria-label="Entry title" />
        <textarea value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} placeholder="How are you feeling today?" rows={12} maxLength={10000} aria-label="Journal entry" />
        <div className="form-buttons">
          <span className={dirty ? "save-state dirty" : "save-state"}>{dirty ? "Unsaved changes" : message || (draft.id ? "All changes saved" : "")}</span>
          <button type="button" className="button button-primary" onClick={save} disabled={pending || !dirty}>{pending ? "Saving…" : "Save entry"}</button>
        </div>
      </div>
    </div>
  );
}
