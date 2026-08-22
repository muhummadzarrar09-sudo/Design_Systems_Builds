"use client";

import type { CSSProperties } from "react";
import type { StyleMeta } from "@/lib/styles";
import StyleChip from "./StyleChip";

type Props = {
  style: StyleMeta;
  index: number;
  checked: boolean;
  onToggle: (name: string) => void;
  onNavigate: (slug: string) => void;
};

/**
 * One pill row. Clicking it launches the design system's Mission Control
 * dashboard. The invisible checkbox is the hit target, so clicking,
 * Tab + Space and screen readers all work.
 */
export default function StyleRow({
  style,
  index,
  checked,
  onToggle,
  onNavigate,
}: Props) {
  return (
    <label
      className={`option option--${style.slug}`}
      data-reveal="left"
      style={{ "--i": index } as CSSProperties}
    >
      <input
        type="checkbox"
        name="style"
        value={style.name}
        checked={checked}
        onChange={() => {
          onToggle(style.name);
          onNavigate(style.slug);
        }}
        aria-label={`Open the ${style.name} dashboard`}
      />
      <span className="row">
        <span className="spot" aria-hidden="true" />
        <span className="num" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
        <StyleChip style={style} />
        <span className="body">
          <span className="name">{style.name}</span>
          <span className="desc">{style.desc}</span>
          <span className="tag">{style.tag}</span>
        </span>
        <span className="check" aria-hidden="true" />
      </span>
    </label>
  );
}
