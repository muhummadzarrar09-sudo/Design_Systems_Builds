export type StyleMeta = {
  slug: string;
  name: string;
  note: string;
  tech: string;
  flavor: string;
};

/** The seven design languages, in the order Z asked for. */
export const STYLES: StyleMeta[] = [
  {
    slug: "skeu",
    name: "Skeuomorphism",
    note: "my take: the best skeuo alive today lives in audio apps",
    tech: "inset shadows · texture",
    flavor: "brass, leather & brushed metal",
  },
  {
    slug: "flat",
    name: "Flat design",
    note: "my take: we survived 2013, some of us miss it",
    tech: "solid colour · zero depth",
    flavor: "bold blocks, no shadows, no mercy",
  },
  {
    slug: "material",
    name: "Material Design",
    note: "my take: the ripple is the best micro-interaction ever shipped",
    tech: "elevation · ripple",
    flavor: "surfaces, ink, motion",
  },
  {
    slug: "neu",
    name: "Neumorphism (soft UI)",
    note: "my take: divisive, but gorgeous in dashboards",
    tech: "dual shadows · soft UI",
    flavor: "soft-extruded out of the canvas",
  },
  {
    slug: "glass",
    name: "Glassmorphism",
    note: "my take: frost beats gradients, always",
    tech: "backdrop-filter · frost",
    flavor: "frosted panels over dark space",
  },
  {
    slug: "clay",
    name: "Claymorphism",
    note: "my take: the one that feels like play-doh",
    tech: "morphing corners · squish",
    flavor: "inflated, squishy, breathing",
  },
  {
    slug: "minimal",
    name: "Minimalism",
    note: "my take: the hardest style to do well",
    tech: "one underline · nothing else",
    flavor: "whitespace, one accent, zero decoration",
  },
];
