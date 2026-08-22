"use client";

import type { CSSProperties } from "react";
import type { StyleMeta } from "@/lib/styles";
import StyleChip from "./StyleChip";

type Props = {
  style: StyleMeta;
  index: number;
  onPick: (style: StyleMeta) => void;
};

/**
 * One language row. Radio for free single-select + :has() styling.
 * The right affordance is a launch chevron — picking one enters that system.
 */
export default function StyleRow({ style, index, onPick }: Props) {
  return (
    <label
      className={`option option--${style.slug}`}
      style={{ "--i": index } as CSSProperties}
    >
      <input
        type="radio"
        name="style"
        value={style.name}
        onChange={() => onPick(style)}
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
        <span className="go" aria-hidden="true">
          Launch
        </span>
      </span>
    </label>
  );
}
