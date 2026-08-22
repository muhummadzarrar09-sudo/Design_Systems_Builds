"use client";

import { useEffect, useRef } from "react";

type Props = {
  selected: string[];
  total: number;
  onRemove: (name: string) => void;
  onSelectAll: () => void;
  onClear: () => void;
};

/** Sticky summary bar: live count, removable pills, bulk actions. */
export default function SummaryBar({
  selected,
  total,
  onRemove,
  onSelectAll,
  onClear,
}: Props) {
  const countRef = useRef<HTMLSpanElement>(null);

  // little pop when the count changes
  useEffect(() => {
    countRef.current?.animate(
      [{ transform: "scale(1.3)" }, { transform: "scale(1)" }],
      { duration: 300, easing: "cubic-bezier(.34, 1.56, .64, 1)" }
    );
  }, [selected.length]);

  const allPicked = selected.length === total;

  return (
    <footer className="bar" aria-live="polite">
      <div className="bar__count">
        <strong ref={countRef}>{selected.length}</strong>
        <span>of {total} picked</span>
      </div>

      <div className="bar__chips">
        {selected.length === 0 ? (
          <span className="bar__empty">
            Nothing picked yet — hover a pill, then click it.
          </span>
        ) : (
          selected.map((name) => (
            <button
              key={name}
              type="button"
              className="pill"
              aria-label={`Remove ${name}`}
              onClick={() => onRemove(name)}
            >
              {name} <span aria-hidden="true">×</span>
            </button>
          ))
        )}
      </div>

      <div className="bar__actions">
        <button type="button" className="btn btn--primary" onClick={onSelectAll}>
          {allPicked ? "Clear all" : "Select all"}
        </button>
        <button type="button" className="btn btn--ghost" onClick={onClear}>
          Clear
        </button>
      </div>
    </footer>
  );
}
