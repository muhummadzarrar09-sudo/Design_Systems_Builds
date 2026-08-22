export type StateSpec = {
  slug: string;
  name: string;
  tagline: string;
  states: {
    rest: string;
    hover: string;
    pressed: string;
    focus: string;
    disabled: string;
  };
  motion: string;
  scroll: string;
  zoom: string;
};

/** Research-backed interaction spec for all seven design systems. */
export const SPECS: StateSpec[] = [
  {
    slug: "skeu",
    name: "Skeuomorphism",
    tagline: "controls you can physically feel",
    states: {
      rest: "Top-lit 3-stop gradients, contact + ambient shadows, inset top highlight, real 1px border on every control.",
      hover: "Gloss brightens (brightness ~1.14) like light catching a real button; control lifts a hair.",
      pressed: "translateY(1px); outer shadows swap to inset — the control visibly depresses; gradient stops shift darker.",
      focus: "2px brass ring with a dark halo so it reads over any material.",
      disabled: "Desaturated, recessed: flatter gradients, dimmed label, no gloss.",
    },
    motion: "150ms ease — quick and physical, like the real object.",
    scroll: "Sticky sidebar rail; 10px machined-metal scrollbar.",
    zoom: "Texture + layered shadows scale cleanly under browser zoom; keep radii 8–12px.",
  },
  {
    slug: "flat",
    name: "Flat design",
    tagline: "states change by color, never depth",
    states: {
      rest: "Solid fill, no shadows, no gradients, blunt corners. Deterministic contrast.",
      hover: "Color swap only — fill shifts ~15%. No shadow, no transform, no lift.",
      pressed: "Fill darkens another ~15–20%. Nothing moves — zero depth cues.",
      focus: "Solid 3px accent ring — crisper than any shadow-based indicator.",
      disabled: "~40% opacity flat fill; no elevation signals of any kind.",
    },
    motion: "100–150ms linear-ish color crossfade. Fast, unambiguous.",
    scroll: "Fluid — everything scrolls; blunt square scrollbar.",
    zoom: "Vector-crisp at any zoom; no blur or texture to degrade.",
  },
  {
    slug: "material",
    name: "Material Design",
    tagline: "surfaces with elevation and state layers",
    states: {
      rest: "Resting elevation (1–2dp cards, 3dp buttons). State layers: hover 8%, press 12% opacity.",
      hover: "Elevation +1 (shadow grows); 8% hover state layer overlays the surface.",
      pressed: "Elevation collapses to 0; scale(0.97); center-origin ripple; 12% state layer.",
      focus: "2px tonal ring via the focus state layer.",
      disabled: "38% opacity container, no elevation, no ripple.",
    },
    motion: "200ms cubic-bezier(.2,0,0,1) standard; ~150–200ms on desktop; emphasized decelerate for entrances.",
    scroll: "Edge-to-edge content; thin 4px scrollbar; FAB stays fixed.",
    zoom: "dp is density-independent — layout reflows and type scales fluidly.",
  },
  {
    slug: "neu",
    name: "Neumorphism (soft UI)",
    tagline: "extruded out of, pressed into",
    states: {
      rest: "Extruded dual shadow — dark bottom-right, light top-left — same color as the surface.",
      hover: "Shadows grow + translateY(-2px); the element rises off the canvas.",
      pressed: "Inset shadows (dark top-left, light bottom-right) — pressed into the surface.",
      focus: "Soft outer ring; never a hard outline.",
      disabled: "Low-contrast shadows, dimmed text — element recedes.",
    },
    motion: "250ms ease — soft and calm; nothing snaps.",
    scroll: "Soft 10px pill scrollbar; surfaces blend with the background.",
    zoom: "Shadows and radii scale uniformly; surface ≈ background keeps the illusion alive.",
  },
  {
    slug: "glass",
    name: "Glassmorphism",
    tagline: "frosted layers over light",
    states: {
      rest: "backdrop-filter blur 10–20px, translucent fill rgba(255,255,255,.06–.1), 1px light border, inset top highlight.",
      hover: "Fill alpha up (.1 → .22) + lift. Never animate backdrop-filter — it repaints every frame.",
      pressed: "Fill alpha up further; scale(.99). Still no blur animation.",
      focus: "Solid ring — translucent rings fail contrast over blur.",
      disabled: "Fill alpha down ~50%, dimmed text.",
    },
    motion: "300ms ease on background/transform only — blur stays constant.",
    scroll: "Blur re-shades every frame while scrolling; keep radii ≤20px and layers few.",
    zoom: "Backdrop-filter has quirks at high zoom; @supports fallback to solid rgba fills.",
  },
  {
    slug: "clay",
    name: "Claymorphism",
    tagline: "squish it, it bounces back",
    states: {
      rest: "16–24px radius, 3–4px border, dual inner + offset outer shadows, soft gradient.",
      hover: "Comes forward — outer shadow blur drops, element lifts, slight scale 1.02.",
      pressed: "Squish scale(.96), 200ms ease-out; inner shadows deepen.",
      focus: "3px thick outline, offset — visible on any clay color.",
      disabled: "Desaturated clay, flattened shadows.",
    },
    motion: "Spring cubic-bezier(.34,1.56,.64,1) — overshoot on entry, bounce on release sells the squish.",
    scroll: "Generous padding everywhere; thick clay-pill scrollbar.",
    zoom: "Large radii + thick borders keep the inflated look at any zoom.",
  },
  {
    slug: "minimal",
    name: "Minimalism",
    tagline: "the quietest system of all",
    states: {
      rest: "Pure black, hairline rules, wide letterspacing. Nothing else.",
      hover: "A color shift or a hairline underline — nothing more.",
      pressed: "Instant color shift. No bounce, no movement, no shadow.",
      focus: "1px hairline outline, offset 4px.",
      disabled: "~30% opacity, completely silent.",
    },
    motion: "≤150ms, often instant. Motion is noise here.",
    scroll: "4px hairline scrollbar; no sticky chrome beyond necessity.",
    zoom: "Black + hairlines are perfect at any zoom — nothing to distort.",
  },
];
