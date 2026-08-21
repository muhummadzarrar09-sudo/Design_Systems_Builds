"use client";

import { useEffect } from "react";

/**
 * MaterialRipple — true click ripple that emanates from the cursor position,
 * active only while the Material theme is selected. Sprint 5 claimed this;
 * the merged tree contained only a leftover keyframe and defensive selectors.
 *
 * Delegated listener (one per app, mounted in the root layout): on pointerdown,
 * if the active theme is material, spawn a .ripple-ink span inside the closest
 * button/.pressable at the click coordinates and let the material-ripple
 * keyframe expand + fade it away. No wrappers, no per-button wiring.
 */
export function MaterialRipple() {
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (document.documentElement.dataset.theme !== "material") return;

      const target = e.target as HTMLElement | null;
      const host = target?.closest("button, .pressable") as HTMLElement | null;
      if (!host || host.hasAttribute("data-no-ripple")) return;

      const rect = host.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ink = document.createElement("span");
      ink.className = "ripple-ink";
      ink.setAttribute("aria-hidden", "true");
      ink.style.left = `${x - size / 2}px`;
      ink.style.top = `${y - size / 2}px`;
      ink.style.width = `${size}px`;
      ink.style.height = `${size}px`;

      host.appendChild(ink);
      ink.addEventListener("animationend", () => ink.remove(), { once: true });
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return null;
}
