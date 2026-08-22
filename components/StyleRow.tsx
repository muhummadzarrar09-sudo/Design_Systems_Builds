"use client";

import type { CSSProperties } from "react";
import type { StyleMeta } from "@/lib/styles";
import StyleChip from "./StyleChip";

type Props = {
  style: StyleMeta;
  index: number;
  checked: boolean;
  onToggle: (name: string) => void;
};

/**
 * One pill row. The invisible checkbox is the real hit target, so clicking,
 * Tab + Space and screen readers all work — CSS :has() does the rest.
 */
export default function StyleRow({ style, index, checked, onToggle }: Props) {
  return (
    <label
      className={`option option--${style.slug}`}
      style={{ "--i": index } as CSSProperties}
    >
      <input
        type="checkbox"
        name="style"
        value={style.name}
        checked={checked}
        onChange={() => onToggle(style.name)}
        aria-label={style.name}
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
