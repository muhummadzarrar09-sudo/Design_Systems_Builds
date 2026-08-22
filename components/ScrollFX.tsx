"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * The scroll motion system (no dependencies):
 *
 *   1. reveal-on-scroll — anything tagged [data-reveal] gets `.is-inview`
 *      when it enters the viewport. A MutationObserver picks up nodes
 *      mounted later (the sticky summary bar, route changes), so nothing
 *      that appears dynamically ever stays hidden.
 *   2. reading progress — a hairline brass bar. Browsers with scroll-driven
 *      animations drive it in pure CSS; everywhere else a rAF loop keeps
 *      a `--p` custom property fed.
 *   3. back-to-top — appears past 640px; stays off /dash routes so it never
 *      squares up against the Material FAB.
 */
export default function ScrollFX() {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);
  const [showTop, setShowTop] = useState(false);

  /* 1 — reveals */
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -7% 0px" }
    );

    const watch = () =>
      document
        .querySelectorAll<HTMLElement>("[data-reveal]:not(.is-inview)")
        .forEach((el) => io.observe(el));

    watch();
    const mo = new MutationObserver(watch); // catch late-mounting nodes
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  /* 2 + 3 — progress & back-to-top */
  useEffect(() => {
    let raf = 0;

    const tick = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      // with scroll-driven animations the CSS timeline owns the transform;
      // this var is the fallback (and the reduced-motion path)
      barRef.current?.style.setProperty("--p", p.toFixed(4));
      const past = window.scrollY > 640;
      setShowTop((prev) => (prev === past ? prev : past));
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const onDash = pathname?.startsWith("/dash") ?? false;

  return (
    <>
      <div ref={barRef} className="progress" aria-hidden="true" />

      {!onDash && (
        <button
          type="button"
          className={`to-top${showTop ? " show" : ""}`}
          aria-label="Back to top"
          tabIndex={showTop ? 0 : -1}
          onClick={() => {
            const reduce = window.matchMedia(
              "(prefers-reduced-motion: reduce)"
            ).matches;
            window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
          }}
        >
          <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M12 19V5M5 12l7-7 7 7"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </>
  );
}
