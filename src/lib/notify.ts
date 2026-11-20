import crypto from "node:crypto";
import { read, update } from "./store";

export type Notification = { id: string; userId: string; text: string; href: string; read: boolean; createdAt: string };
const NOTES = { list: [] as Notification[] };

export async function notify(userId: string, text: string, href: string) {
  await update("notifications", NOTES, (db) => ({
    list: [{ id: crypto.randomUUID(), userId, text, href, read: false, createdAt: new Date().toISOString() }, ...db.list].slice(0, 2000)
  }));
}

export async function notificationsFor(userId: string) {
  return (await read("notifications", NOTES)).list.filter((n) => n.userId === userId);
}

export async function unreadCount(userId: string) {
  return (await notificationsFor(userId)).filter((n) => !n.read).length;
}

/** Marks a notification read and returns where it should take the user. */
export async function openNotification(userId: string, id: string) {
  let href: string | null = null;
  await update("notifications", NOTES, (db) => ({
    list: db.list.map((n) => {
      if (n.id !== id || n.userId !== userId) return n;
      href = n.href;
      return { ...n, read: true };
    })
  }));
  return href as string | null;
}

export async function markAllRead(userId: string) {
  await update("notifications", NOTES, (db) => ({
    list: db.list.map((n) => (n.userId === userId ? { ...n, read: true } : n))
  }));
}

export async function deleteNotificationsFor(userId: string) {
  await update("notifications", NOTES, (db) => ({ list: db.list.filter((n) => n.userId !== userId) }));
}
