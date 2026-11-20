"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";
import { createPost, removePost, replyToPost } from "../actions/records";

export function NewPostForm() {
  const [state, action, pending] = useActionState(createPost, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="form-card new-post">
      <h2>Start a conversation</h2>
      <label className="field"><span>Title</span><input name="title" maxLength={120} required placeholder="e.g. Tips for sleeping in the third trimester?" /></label>
      <label className="field"><span>Your post</span><textarea name="body" rows={4} maxLength={3000} required /></label>
      {state?.error && <p className="form-error" role="alert">{state.error}</p>}
      {state?.ok && <p className="form-ok" role="status">{state.ok}</p>}
      <button className="button button-primary" disabled={pending}>{pending ? "Posting…" : "Post"}</button>
    </form>
  );
}

export function ReplyForm({ postId }: { postId: string }) {
  const [state, action, pending] = useActionState(replyToPost, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return (
    <form ref={ref} action={action} className="reply-form">
      <input type="hidden" name="postId" value={postId} />
      <input name="body" placeholder="Write a reply…" maxLength={2000} required aria-label="Reply" />
      <button disabled={pending}>{pending ? "…" : "Reply"}</button>
      {state?.error && <p className="form-error" role="alert">{state.error}</p>}
    </form>
  );
}

export function DeletePostButton({ postId }: { postId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className="post-delete"
      disabled={pending}
      onClick={() => {
        if (window.confirm("Delete this post and its replies?")) start(() => removePost(postId));
      }}
    >
      Delete
    </button>
  );
}
