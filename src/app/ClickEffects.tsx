"use client";

import { useEffect } from "react";

// Everything that gets a ripple when clicked or tapped.
const RIPPLE_TARGETS = [
  "button",
  ".button",
  ".nav-cta",
  ".nav-login",
  ".nav-emergency",
  ".icon-button",
  ".oauth-button",
  ".ld-btn",
  ".ld-journey-cta",
  ".ld-reel-pic",
  ".hub-card",
  ".journey-card",
  ".size-card",
  ".week-chip",
  ".quick-links a",
  ".dash-list a",
  ".result-list a",
  ".note-list a",
  ".appt-row",
  ".dropdown a",
  ".nav-links > a",
  ".journey-option",
  ".check"
].join(", ");

/**
 * One listener for the whole site: on press, a soft circle spreads out from the exact spot that
 * was clicked, in the element's own text colour (light on dark buttons, teal on light ones).
 * The ripple sits in its own clipped layer, so badges and dropdowns are never cut off.
 */
export default function ClickEffects() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    function onPointerDown(e: PointerEvent) {
      if (reduce.matches || e.button !== 0) return;
      const host = (e.target as Element | null)?.closest<HTMLElement>(RIPPLE_TARGETS);
      if (!host || host.matches(":disabled, [aria-disabled='true']")) return;

      if (getComputedStyle(host).position === "static") host.style.position = "relative";
      const rect = host.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2.2;

      const layer = document.createElement("span");
      layer.className = "click-ripple-layer";
      layer.setAttribute("aria-hidden", "true");
      const ripple = document.createElement("span");
      ripple.className = "click-ripple";
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      layer.appendChild(ripple);
      host.appendChild(layer);
      ripple.addEventListener("animationend", () => layer.remove(), { once: true });
      // Safety net in case the animation never runs (e.g. the element is hidden mid-click).
      window.setTimeout(() => layer.remove(), 1200);
    }

    document.addEventListener("pointerdown", onPointerDown, { passive: true });
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return null;
}
