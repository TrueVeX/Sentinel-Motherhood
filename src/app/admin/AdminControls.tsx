"use client";

import { useTransition } from "react";
import type { Role } from "@/lib/auth";
import { adminDeleteMessage, adminReset, adminSetRole } from "../actions/records";

export function RoleSelect({ userId, role }: { userId: string; role: Role }) {
  const [pending, start] = useTransition();
  return (
    <select
      defaultValue={role}
      disabled={pending}
      aria-label="Role"
      onChange={(e) => {
        const next = e.target.value as Role;
        start(() => adminSetRole(userId, next));
      }}
    >
      <option value="mother">mother</option>
      <option value="professional">professional</option>
      <option value="admin">admin</option>
    </select>
  );
}

export function DeleteMessageButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button type="button" className="post-delete" disabled={pending} onClick={() => start(() => adminDeleteMessage(id))}>
      Delete
    </button>
  );
}

export function ResetButton({ what }: { what: "poll" | "stats" }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className="danger-button"
      disabled={pending}
      onClick={() => {
        if (window.confirm(`Reset the ${what === "poll" ? "poll votes" : "visitor stats"} to zero?`)) start(() => adminReset(what));
      }}
    >
      {pending ? "Resetting…" : `Reset ${what === "poll" ? "poll" : "stats"}`}
    </button>
  );
}
