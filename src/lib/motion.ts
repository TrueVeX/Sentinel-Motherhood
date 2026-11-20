// Small helpers for the homepage's scroll-driven animation.
// One requestAnimationFrame loop runs while any section is listening; each section reads
// its own scroll position and writes styles directly, so scrolling never re-renders React.

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Where `v` sits between `a` and `b`, clamped to 0–1. */
export const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

type Tick = (time: number) => void;
const subscribers = new Set<Tick>();
let raf = 0;

function loop(time: number) {
  subscribers.forEach((fn) => fn(time));
  raf = subscribers.size ? requestAnimationFrame(loop) : 0;
}

export function onFrame(fn: Tick): () => void {
  subscribers.add(fn);
  if (!raf) raf = requestAnimationFrame(loop);
  return () => {
    subscribers.delete(fn);
    if (!subscribers.size && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };
}

/**
 * Progress through a tall section whose child is `position: sticky`.
 * 0 when the sticky child first pins, 1 when it is about to unpin.
 * Works whatever the sticky `top` is (here: just below the site header).
 */
export function pinProgress(section: HTMLElement, sticky: HTMLElement) {
  const rect = section.getBoundingClientRect();
  const s = sticky.getBoundingClientRect();
  const span = Math.max(1, rect.height - s.height);
  return { p: clamp((s.top - rect.top) / span), rect, vh: window.innerHeight };
}
