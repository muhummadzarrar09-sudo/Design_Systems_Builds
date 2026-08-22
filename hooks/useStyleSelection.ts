"use client";

import { useCallback, useEffect, useState } from "react";
import { STYLES } from "@/lib/styles";

const KEY = "ds-picker-selection";

/**
 * Selection state for the picker, persisted to localStorage.
 * The returned array always preserves the STYLES order.
 */
export function useStyleSelection() {
  const [selected, setSelected] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  // hydrate once
  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
      if (Array.isArray(raw)) {
        const valid = raw.filter((v: unknown) =>
          STYLES.some((s) => s.name === v)
        );
        setSelected(valid);
      }
    } catch {
      /* first visit / private mode */
    }
    setReady(true);
  }, []);

  // persist on change
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(selected));
    } catch {
      /* storage unavailable */
    }
  }, [selected, ready]);

  const toggle = useCallback((name: string) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  }, []);

  const setAll = useCallback((names: string[]) => setSelected(names), []);
  const clear = useCallback(() => setSelected([]), []);

  return { selected, ready, toggle, setAll, clear };
}
