import type { StyleMeta } from "@/lib/styles";

/** Renders the idle mini-icon for a style. All artwork is CSS pseudo-elements. */
export default function StyleChip({ style }: { style: StyleMeta }) {
  return <span className={`chip chip--${style.slug}`} aria-hidden="true" />;
}
