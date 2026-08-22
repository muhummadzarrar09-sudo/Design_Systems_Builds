"use client";

import { useEffect } from "react";

/**
 * Butter-smooth inertial scrolling — a hand-rolled, dependency-free take on
 * Lenis. Wheel input is intercepted and the window glides toward its target
 * with a lerp every frame.
 *
 * Native behaviour is respected everywhere it matters:
 *   - prefers-reduced-motion       → disabled entirely
 *   - touch devices                → native momentum (no wheel events anyway)
 *   - pinch-zoom / horizontal swipes → passed through
 *   - inner scrollers (dashboard rail, textareas, selects) consume their own
 *     delta natively before the window takes over
 *   - keyboard / anchor / scrollbar scrolls resync instantly — we never
 *     fight the user
 */
export default function SmoothScroll() {
  useEffect(() => {
    const doc = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // lerp factor — lower = longer, dreamier glide
    const EASE = 0.105;

    let target = window.scrollY;
    let current = target;
    let raf = 0;

    const maxScroll = () =>
      Math.max(0, doc.scrollHeight - window.innerHeight);

    // instant programmatic scrolls so we never fight CSS scroll-behavior;
    // ancient Safari (no ScrollToOptions) gets the two-arg form, which is
    // instant there anyway
    const instant = (y: number) => {
      if ("scrollBehavior" in doc.style) {
        window.scrollTo({ top: y, behavior: "instant" });
      } else {
        window.scrollTo(0, y);
      }
    };

    const loop = () => {
      current += (target - current) * EASE;
      if (Math.abs(target - current) < 0.5) {
        current = target;
        raf = 0;
      } else {
        raf = requestAnimationFrame(loop);
      }
      instant(current);
    };

    /** true when something between the cursor and <html> can still eat this delta */
    const insideInnerScroller = (e: WheelEvent) => {
      const path = typeof e.composedPath === "function" ? e.composedPath() : [];
      for (const node of path) {
        if (node === doc || node === document) return false;
        if (!(node instanceof HTMLElement)) continue;
        if (node.scrollHeight <= node.clientHeight + 1) continue;
        const oy = getComputedStyle(node).overflowY;
        if (oy !== "auto" && oy !== "scroll") continue;
        const atTop = node.scrollTop <= 0;
        const atBottom =
          node.scrollTop + node.clientHeight >= node.scrollHeight - 1;
        if ((e.deltaY > 0 && !atBottom) || (e.deltaY < 0 && !atTop)) return true;
      }
      return false;
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.defaultPrevented) return; // pinch-zoom / already handled
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // trackpad swipe
      if (insideInnerScroller(e)) return; // dashboard rail etc. scrolls itself

      e.preventDefault();

      let dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 40; // lines (Firefox)
      else if (e.deltaMode === 2) dy *= window.innerHeight; // pages

      target = Math.max(0, Math.min(maxScroll(), target + dy));
      if (!raf) {
        current = window.scrollY;
        raf = requestAnimationFrame(loop);
      }
    };

    // any scroll we didn't cause (keyboard, anchors, scrollbar drag,
    // find-in-page, route change) resyncs the glide target instantly
    const onScroll = () => {
      if (!raf) target = current = window.scrollY;
    };

    const SCROLL_KEYS = new Set([
      " ",
      "ArrowUp",
      "ArrowDown",
      "PageUp",
      "PageDown",
      "Home",
      "End",
    ]);
    const onKeyDown = (e: KeyboardEvent) => {
      if (!raf || !SCROLL_KEYS.has(e.key)) return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.isContentEditable ||
          /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(t.tagName))
      )
        return;
      // hand control back to the browser mid-glide
      cancelAnimationFrame(raf);
      raf = 0;
      target = current = window.scrollY;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKeyDown);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
