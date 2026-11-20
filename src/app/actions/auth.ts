"use server";

import { redirect } from "next/navigation";
import {
  checkPassword,
  createUser,
  endSession,
  getCurrentUser,
  homeFor,
  requireUser,
  safeNext,
  startSession,
  updateUser,
  type Journey
} from "@/lib/auth";
import { notify } from "@/lib/notify";

export type FormState = { error?: string; ok?: string } | undefined;

const JOURNEYS: Journey[] = ["pregnancy", "birth", "motherhood"];
const text = (f: FormData, key: string, max = 200) => String(f.get(key) ?? "").trim().slice(0, max);
const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(new Date(v).getTime());

export async function signup(_: FormState, form: FormData): Promise<FormState> {
  const name = text(form, "name", 60);
  const email = text(form, "email", 120).toLowerCase();
  const password = String(form.get("password") ?? "");
  const role = form.get("role") === "professional" ? "professional" : "mother";
  const journey = text(form, "journey");

  if (name.length < 2) return { error: "Please enter your name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Please enter a valid email address." };
  if (password.length < 8) return { error: "Your password needs at least 8 characters." };

  const user = await createUser({ name, email, password, role });
  if (!user) return { error: "An account with that email already exists. Try logging in instead." };

  await startSession(user.id);
  await notify(user.id, `Welcome to Sentinel, ${user.name.split(" ")[0]}! Finish setting up your profile.`, "/onboarding");
  redirect(`/onboarding${JOURNEYS.includes(journey as Journey) ? `?journey=${journey}` : ""}`);
}

export async function login(_: FormState, form: FormData): Promise<FormState> {
  const user = await checkPassword(text(form, "email", 120), String(form.get("password") ?? ""));
  if (!user) return { error: "That email and password don’t match. Please try again." };
  await startSession(user.id);
  // Go back to the page they were trying to open, or to their dashboard.
  redirect(safeNext(form.get("next")) ?? homeFor(user));
}

export async function logout() {
  await endSession();
  redirect("/");
}

export async function completeOnboarding(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const name = text(form, "name", 60);
  const journey = text(form, "journey") as Journey;
  const dueDate = text(form, "dueDate");
  const babyBirthDate = text(form, "babyBirthDate");

  if (name.length < 2) return { error: "Please enter your name." };
  if (user.role === "mother" && !JOURNEYS.includes(journey)) return { error: "Please choose your journey." };
  if (dueDate && !isDate(dueDate)) return { error: "Please check the due date." };
  if (babyBirthDate && !isDate(babyBirthDate)) return { error: "Please check your baby’s birth date." };

  await updateUser(user.id, {
    name,
    journey: JOURNEYS.includes(journey) ? journey : null,
    dueDate: dueDate || null,
    babyBirthDate: babyBirthDate || null,
    onboarded: true
  });
  redirect("/dashboard");
}

/** Used by pages that should never show for signed-in people (login, sign up). */
export async function redirectIfSignedIn(next?: string) {
  const user = await getCurrentUser();
  if (user) redirect(safeNext(next) ?? homeFor(user));
}
