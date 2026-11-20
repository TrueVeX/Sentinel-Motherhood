import crypto from "node:crypto";
import type { Role } from "./auth";
import { read, update } from "./store";

const id = () => crypto.randomUUID();
const now = () => new Date().toISOString();

// ---- Appointments (private to each user) ----
export type Appointment = {
  id: string;
  userId: string;
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
  notes: string;
  createdAt: string;
};
const APPTS = { list: [] as Appointment[] };

export async function appointmentsFor(userId: string) {
  return (await read("appointments", APPTS)).list
    .filter((a) => a.userId === userId)
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
}
export async function getAppointment(userId: string, apptId: string) {
  return (await appointmentsFor(userId)).find((a) => a.id === apptId) ?? null;
}
export async function addAppointment(data: Omit<Appointment, "id" | "createdAt">) {
  const appt = { ...data, id: id(), createdAt: now() };
  await update("appointments", APPTS, (db) => ({ list: [...db.list, appt] }));
  return appt;
}
export async function deleteAppointment(userId: string, apptId: string) {
  await update("appointments", APPTS, (db) => ({ list: db.list.filter((a) => !(a.id === apptId && a.userId === userId)) }));
}
export function isUpcoming(a: Appointment) {
  return `${a.date}T${a.time || "23:59"}` >= new Date().toISOString().slice(0, 16);
}

// ---- Journal (private to each user) ----
export type JournalEntry = { id: string; userId: string; title: string; body: string; mood: string; createdAt: string; updatedAt: string };
const JOURNAL = { list: [] as JournalEntry[] };

export async function journalFor(userId: string) {
  return (await read("journal", JOURNAL)).list
    .filter((e) => e.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export async function saveJournalEntry(userId: string, entry: { id?: string; title: string; body: string; mood: string }) {
  let saved: JournalEntry | null = null;
  await update("journal", JOURNAL, (db) => {
    if (entry.id) {
      return {
        list: db.list.map((e) => {
          if (e.id !== entry.id || e.userId !== userId) return e;
          saved = { ...e, title: entry.title, body: entry.body, mood: entry.mood, updatedAt: now() };
          return saved;
        })
      };
    }
    saved = { id: id(), userId, title: entry.title, body: entry.body, mood: entry.mood, createdAt: now(), updatedAt: now() };
    return { list: [...db.list, saved] };
  });
  return saved as JournalEntry | null;
}
export async function deleteJournalEntry(userId: string, entryId: string) {
  await update("journal", JOURNAL, (db) => ({ list: db.list.filter((e) => !(e.id === entryId && e.userId === userId)) }));
}

// ---- Community (visible to signed-in members) ----
export type Reply = { id: string; userId: string; authorName: string; authorRole: Role; body: string; createdAt: string };
export type Post = { id: string; userId: string; authorName: string; authorRole: Role; title: string; body: string; createdAt: string; replies: Reply[] };
const POSTS = { list: [] as Post[] };

export async function listPosts() {
  return (await read("posts", POSTS)).list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export async function addPost(data: Omit<Post, "id" | "createdAt" | "replies">) {
  const post: Post = { ...data, id: id(), createdAt: now(), replies: [] };
  await update("posts", POSTS, (db) => ({ list: [...db.list, post] }));
  return post;
}
export async function addReply(postId: string, data: Omit<Reply, "id" | "createdAt">) {
  let post: Post | null = null;
  await update("posts", POSTS, (db) => ({
    list: db.list.map((p) => {
      if (p.id !== postId) return p;
      post = { ...p, replies: [...p.replies, { ...data, id: id(), createdAt: now() }] };
      return post;
    })
  }));
  return post as Post | null;
}
export async function deletePost(postId: string) {
  await update("posts", POSTS, (db) => ({ list: db.list.filter((p) => p.id !== postId) }));
}

// ---- Contact messages ----
export type ContactMessage = { id: string; name: string; email: string; message: string; createdAt: string };
const CONTACT = { list: [] as ContactMessage[] };

export async function addContactMessage(data: Omit<ContactMessage, "id" | "createdAt">) {
  await update("contact", CONTACT, (db) => ({ list: [{ ...data, id: id(), createdAt: now() }, ...db.list].slice(0, 500) }));
}
export async function listContactMessages() {
  return (await read("contact", CONTACT)).list;
}
export async function deleteContactMessage(messageId: string) {
  await update("contact", CONTACT, (db) => ({ list: db.list.filter((m) => m.id !== messageId) }));
}

// Removes everything a user owns (used when an account is deleted).
export async function deleteUserRecords(userId: string) {
  await update("appointments", APPTS, (db) => ({ list: db.list.filter((a) => a.userId !== userId) }));
  await update("journal", JOURNAL, (db) => ({ list: db.list.filter((e) => e.userId !== userId) }));
}
