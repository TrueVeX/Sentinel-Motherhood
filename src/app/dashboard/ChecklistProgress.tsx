"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { checklistGroups } from "../data";
import { load } from "@/lib/browser-storage";

// Shows hospital bag progress, which is saved in this browser by the checklist tool.
export default function ChecklistProgress() {
  const [done, setDone] = useState(0);
  const [total, setTotal] = useState(checklistGroups.reduce((n, g) => n + g.items.length, 0));

  useEffect(() => {
    const checked = load<Record<string, boolean>>("sm-checklist", {});
    const custom = load<string[]>("sm-checklist-custom", []);
    const keys = [
      ...checklistGroups.flatMap((g) => g.items.map((i) => `${g.title}:${i}`)),
      ...custom.map((i) => `My items:${i}`)
    ];
    setTotal(keys.length);
    setDone(keys.filter((k) => checked[k]).length);
  }, []);

  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <Link href="/tools/hospital-checklist" className="dash-card">
      <h3>Hospital bag</h3>
      <p className="dash-big">{pct}%</p>
      <div className="progress"><span style={{ width: `${pct}%` }} /></div>
      <small>{done} of {total} packed · open checklist →</small>
    </Link>
  );
}
