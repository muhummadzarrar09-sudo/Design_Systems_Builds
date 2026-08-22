export type Inspo = {
  slug: string;
  num: string;
  name: string;
  steal: string;
};

/**
 * AI concept frames: one brief (a space Mission Control dashboard)
 * re-skinned in all seven design languages. These are the reference
 * cards we build from.
 */
export const INSPOS: Inspo[] = [
  {
    slug: "skeuomorphism",
    num: "01",
    name: "Skeuomorphism",
    steal: "Brushed metal, beveled gauges, toggle switches, embossed labels — depth you can feel.",
  },
  {
    slug: "flat-design",
    num: "02",
    name: "Flat design",
    steal: "Zero shadows, blunt colour blocks, Swiss grids, one bold accent against the void.",
  },
  {
    slug: "material-design",
    num: "03",
    name: "Material Design",
    steal: "Elevated cards, layered shadows, floating action buttons, ripple feedback on every tap.",
  },
  {
    slug: "neumorphism",
    num: "04",
    name: "Neumorphism (soft UI)",
    steal: "Twin soft shadows, same-colour surfaces, pill buttons — UI pressed out of the canvas.",
  },
  {
    slug: "glassmorphism",
    num: "05",
    name: "Glassmorphism",
    steal: "Frosted panels, backdrop blur, hairline light borders, layered depth over a glow.",
  },
  {
    slug: "claymorphism",
    num: "06",
    name: "Claymorphism",
    steal: "Inflated squishy shapes, thick outlines, inner shadows and glossy highlights — play-doh UI.",
  },
  {
    slug: "minimalism",
    num: "07",
    name: "Minimalism",
    steal: "Pure black space, one thin line, tiny uppercase labels, a single quiet accent.",
  },
];
