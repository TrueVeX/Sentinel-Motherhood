// Calendar reminders: a Google Calendar link (great on Android) or a .ics file (iPhone, Outlook).
// Reminders then come from the phone's own calendar, which is far more reliable than web notifications.

export type CalEvent = {
  title: string;
  details?: string;
  /** All-day event on this date (YYYY-MM-DD)… */
  date?: string;
  /** …or a timed event starting here (local time). */
  start?: Date;
  minutes?: number;
  daily?: boolean;
};

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
const hms = (d: Date) => `${pad(d.getHours())}${pad(d.getMinutes())}00`;
const nextDay = (date: string) => {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + 1);
  return ymd(d);
};

export function googleCalendarUrl(e: CalEvent) {
  let dates: string;
  if (e.date) dates = `${e.date.replaceAll("-", "")}/${nextDay(e.date)}`;
  else {
    const end = new Date(e.start!.getTime() + (e.minutes ?? 10) * 60000);
    dates = `${ymd(e.start!)}T${hms(e.start!)}/${ymd(end)}T${hms(end)}`;
  }
  const params = new URLSearchParams({ action: "TEMPLATE", text: e.title, dates, details: e.details ?? "" });
  if (e.daily) params.set("recur", "RRULE:FREQ=DAILY");
  return `https://calendar.google.com/calendar/render?${params}`;
}

const escapeIcs = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

export function downloadIcs(filename: string, events: CalEvent[]) {
  const stamp = `${ymd(new Date())}T${hms(new Date())}`;
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Sentinel Motherhood//EN", "CALSCALE:GREGORIAN"];
  events.forEach((e, i) => {
    lines.push("BEGIN:VEVENT", `UID:${stamp}-${i}@sentinel-motherhood`, `DTSTAMP:${stamp}`, `SUMMARY:${escapeIcs(e.title)}`);
    if (e.details) lines.push(`DESCRIPTION:${escapeIcs(e.details)}`);
    if (e.date) {
      lines.push(`DTSTART;VALUE=DATE:${e.date.replaceAll("-", "")}`, `DTEND;VALUE=DATE:${nextDay(e.date)}`);
      // Remind at 9am the day before.
      lines.push("BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${escapeIcs(e.title)}`, "TRIGGER:-PT15H", "END:VALARM");
    } else {
      const end = new Date(e.start!.getTime() + (e.minutes ?? 10) * 60000);
      lines.push(`DTSTART:${ymd(e.start!)}T${hms(e.start!)}`, `DTEND:${ymd(end)}T${hms(end)}`);
      if (e.daily) lines.push("RRULE:FREQ=DAILY");
      lines.push("BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${escapeIcs(e.title)}`, "TRIGGER:PT0M", "END:VALARM");
    }
    lines.push("END:VEVENT");
  });
  lines.push("END:VCALENDAR");
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
