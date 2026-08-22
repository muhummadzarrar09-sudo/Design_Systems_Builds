export type StyleMeta = {
  slug: string;
  name: string;
  desc: string;
  tag: string;
};

/** The seven design languages, in the order Z asked for. */
export const STYLES: StyleMeta[] = [
  {
    slug: "skeu",
    name: "Skeuomorphism",
    desc: "Leather, brass and brushed metal — UI that imitates the physical world.",
    tag: "inset shadows · gradients · texture",
  },
  {
    slug: "flat",
    name: "Flat design",
    desc: "Bold colour blocks, Swiss grids and zero depth — the great 2013 reset.",
    tag: "solid colour · no depth",
  },
  {
    slug: "material",
    name: "Material Design",
    desc: "Surfaces with real elevation, ink-based motion and a ripple for every tap.",
    tag: "elevation · motion · ripple",
  },
  {
    slug: "neu",
    name: "Neumorphism (soft UI)",
    desc: "Twin soft shadows push the UI out of — or into — the canvas.",
    tag: "dual soft shadows",
  },
  {
    slug: "glass",
    name: "Glassmorphism",
    desc: "Frosted panels over colour: translucency, blur and a hairline light border.",
    tag: "backdrop-filter · translucency",
  },
  {
    slug: "clay",
    name: "Claymorphism",
    desc: "Inflated, squishy shapes with thick outlines and inner shadows.",
    tag: "morphing border-radius",
  },
  {
    slug: "minimal",
    name: "Minimalism",
    desc: "Whitespace, one accent, zero decoration — the hardest style to do well.",
    tag: "one underline · nothing else",
  },
];
