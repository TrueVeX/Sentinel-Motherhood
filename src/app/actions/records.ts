"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  checkPassword,
  deleteUser,
  listUsers,
  endSession,
  getCurrentUser,
  requireRole,
  requireUser,
  setPassword,
  updateUser,
  type Journey,
  type Role
} from "@/lib/auth";
import { deleteNotificationsFor, markAllRead, notify } from "@/lib/notify";
import {
  addAppointment,
  addContactMessage,
  addPost,
  addReply,
  deleteAppointment,
  deleteContactMessage,
  deleteJournalEntry,
  deletePost,
  deleteUserRecords,
  listPosts,
  saveJournalEntry
} from "@/lib/records";
import { update } from "@/lib/store";
import type { FormState } from "./auth";

const text = (f: FormData, key: string, max = 200) => String(f.get(key) ?? "").trim().slice(0, max);
const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(new Date(v).getTime());

// ---- Journal ----
export async function saveJournal(input: { id?: string; title: string; body: string; mood: string }) {
  const user = await requireUser();
  const title = input.title.trim().slice(0, 120) || "Untitled entry";
  const body = input.body.slice(0, 10000);
  if (!body.trim()) return { error: "Write something before saving." };
  const saved = await saveJournalEntry(user.id, { id: input.id, title, body, mood: input.mood.slice(0, 4) });
  revalidatePath("/journal");
  return saved ? { id: saved.id } : { error: "Couldn’t save this entry." };
}

export async function removeJournal(id: string) {
  const user = await requireUser();
  await deleteJournalEntry(user.id, id);
  revalidatePath("/journal");
}

// ---- Community ----
export async function createPost(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const title = text(form, "title", 120);
  const body = text(form, "body", 3000);
  if (title.length < 4) return { error: "Please add a short title." };
  if (body.length < 4) return { error: "Please write your question or post." };
  await addPost({ userId: user.id, authorName: user.name, authorRole: user.role, title, body });
  revalidatePath("/community");
  return { ok: "Posted! Other members can now reply." };
}

export async function replyToPost(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const postId = text(form, "postId", 64);
  const body = text(form, "body", 2000);
  if (body.length < 2) return { error: "Please write a reply." };
  const post = await addReply(postId, { userId: user.id, authorName: user.name, authorRole: user.role, body });
  if (!post) return { error: "That post no longer exists." };
  if (post.userId !== user.id) {
    await notify(post.userId, `${user.name} replied to “${post.title}”`, `/community#post-${post.id}`);
  }
  revalidatePath("/community");
  return { ok: "Reply posted." };
}

export async function removePost(postId: string) {
  const user = await requireUser();
  const post = (await listPosts()).find((p) => p.id === postId);
  if (!post || (post.userId !== user.id && user.role !== "admin")) return;
  await deletePost(postId);
  revalidatePath("/community");
}

// ---- Appointments ----
export async function createAppointment(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const title = text(form, "title", 100);
  const date = text(form, "date", 10);
  const time = text(form, "time", 5);
  if (title.length < 2) return { error: "Please give the appointment a name." };
  if (!isDate(date)) return { error: "Please choose a date." };
  if (time && !/^\d{2}:\d{2}$/.test(time)) return { error: "Please check the time." };
  const appt = await addAppointment({
    userId: user.id,
    title,
    type: text(form, "type", 40) || "Other",
    date,
    time,
    location: text(form, "location", 120),
    notes: text(form, "notes", 1000)
  });
  await notify(user.id, `Appointment added: ${appt.title} on ${appt.date}`, `/appointments/${appt.id}`);
  revalidatePath("/appointments");
  redirect(`/appointments/${appt.id}`);
}

export async function removeAppointment(id: string) {
  const user = await requireUser();
  await deleteAppointment(user.id, id);
  revalidatePath("/appointments");
  redirect("/appointments");
}

// ---- Notifications ----
export async function readAllNotifications() {
  const user = await requireUser();
  await markAllRead(user.id);
  revalidatePath("/", "layout");
}

// ---- Contact ----
export async function sendContact(_: FormState, form: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  const name = text(form, "name", 60) || user?.name || "";
  const email = text(form, "email", 120) || user?.email || "";
  const message = text(form, "message", 2000);
  if (name.length < 2) return { error: "Please enter your name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Please enter a valid email address." };
  if (message.length < 5) return { error: "Please write a message." };
  await addContactMessage({ name, email, message });
  return { ok: "Thanks! Your message has been sent to the Sentinel team." };
}

// ---- Profile & settings ----
export async function saveProfile(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const name = text(form, "name", 60);
  const dueDate = text(form, "dueDate", 10);
  const babyBirthDate = text(form, "babyBirthDate", 10);
  const journey = text(form, "journey", 20) as Journey;
  if (name.length < 2) return { error: "Please enter your name." };
  if (dueDate && !isDate(dueDate)) return { error: "Please check the due date." };
  if (babyBirthDate && !isDate(babyBirthDate)) return { error: "Please check the birth date." };
  await updateUser(user.id, {
    name,
    dueDate: dueDate || null,
    babyBirthDate: babyBirthDate || null,
    ...(["pregnancy", "birth", "motherhood"].includes(journey) ? { journey } : {})
  });
  revalidatePath("/", "layout");
  return { ok: "Profile saved." };
}

export async function changePassword(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const current = String(form.get("current") ?? "");
  const next = String(form.get("next") ?? "");
  // Accounts made with Google or Apple have no password yet, so there's nothing to check.
  if (user.hasPassword && !(await checkPassword(user.email, current))) return { error: "Your current password isn’t right." };
  if (next.length < 8) return { error: "Your new password needs at least 8 characters." };
  await setPassword(user.id, next);
  revalidatePath("/settings");
  return { ok: user.hasPassword ? "Password changed." : "Password set. You can now also log in with your email." };
}

export async function deleteAccount(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  if (text(form, "confirm") !== "DELETE") return { error: "Type DELETE to confirm." };
  if (user.role === "admin") {
    // Never leave members without an admin: allowed if another admin exists, or nobody else is signed up.
    const others = (await listUsers()).filter((u) => u.id !== user.id);
    if (others.length && !others.some((u) => u.role === "admin")) {
      return { error: "Make another member an admin on the Admin page first, so the site still has an admin." };
    }
  }
  await deleteUserRecords(user.id);
  await deleteNotificationsFor(user.id);
  await endSession();
  await deleteUser(user.id);
  redirect("/");
}

// ---- Admin ----
export async function adminSetRole(userId: string, role: Role) {
  const admin = await requireRole("admin");
  if (userId === admin.id || !["mother", "professional", "admin"].includes(role)) return;
  await updateUser(userId, { role });
  revalidatePath("/admin");
}

export async function adminDeleteMessage(id: string) {
  await requireRole("admin");
  await deleteContactMessage(id);
  revalidatePath("/admin");
}

export async function adminReset(what: "poll" | "stats") {
  await requireRole("admin");
  if (what === "poll") await update("poll", { yes: 0, maybe: 0, no: 0 }, () => ({ yes: 0, maybe: 0, no: 0 }));
  else await update("stats", { visits: 0, questions: 0, aiAnswers: 0, offlineAnswers: 0 }, () => ({ visits: 0, questions: 0, aiAnswers: 0, offlineAnswers: 0 }));
  revalidatePath("/admin");
}
