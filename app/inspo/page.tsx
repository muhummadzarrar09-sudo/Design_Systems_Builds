"use client";

import type { JSX } from "react";
import { Rivets, BrassPlate, Strap } from "@/components/Skeuo";

type Style = {
  slug: string;
  name: string;
  era: string;
  material: string;
  blurb: string;
  swatch: string;
  /** Background gradient for the swatch card */
  card: string;
  /** The decorative element rendered inside the swatch */
  render: () => JSX.Element;
};

function Switch3D({ on, up }: { on: boolean; up: boolean }) {
  return (
    <div className={`mini-switch ${on ? "on" : "off"} ${up ? "up" : "down"}`}>
      <div className="mini-cover" />
      <div className="mini-slot" />
      <div className="mini-lever" />
    </div>
  );
}

function Knob3D({ angle }: { angle: number }) {
  return (
    <div className="mini-knob">
      <div className="mini-knob-bezel">
        <div className="mini-knob-face" style={{ transform: `rotate(${angle}deg)` }}>
          <span className="mini-knob-ind" />
        </div>
      </div>
    </div>
  );
}

const styles: Style[] = [
  {
    slug: "skeuomorphism",
    name: "Skeuomorphism",
    era: "pre-2013",
    material: "Leather · Brass · Chrome",
    blurb: "Every pixel imitates a real object. Depth comes from shadows and highlights, not color.",
    swatch: "#3a1808",
    card: "linear-gradient(180deg,#4a2a14,#2a1408)",
    render: () => <Knob3D angle={45} />,
  },
  {
    slug: "glassmorphism",
    name: "Glassmorphism",
    era: "2020+",
    material: "Frosted Glass · Blur",
    blurb: "Translucent surfaces with backdrop blur. Depth from layered translucency, not shadow.",
    swatch: "#88c0ff",
    card: "linear-gradient(135deg,#ff7eb6 0%,#88c0ff 50%,#5e81ac 100%)",
    render: () => (
      <div className="mini-glass-card">
        <div className="mini-glass-line w70" />
        <div className="mini-glass-line w50" />
        <div className="mini-glass-line w80" />
      </div>
    ),
  },
  {
    slug: "neumorphism",
    name: "Neumorphism",
    era: "2020",
    material: "Soft Clay · Mono-shadow",
    blurb: "Embossed out of the same surface. Two opposing soft shadows create the illusion of depth.",
    swatch: "#d6d8db",
    card: "linear-gradient(180deg,#e8eaed,#c8ccd0)",
    render: () => (
      <div className="mini-neu">
        <div className="mini-neu-knob" />
        <div className="mini-neu-knob" />
        <div className="mini-neu-knob" />
      </div>
    ),
  },
  {
    slug: "flat-design",
    name: "Flat Design",
    era: "2013+",
    material: "Solid Color · No Shadow",
    blurb: "No skeuomorphism, no gradients, no shadows. Color and typography do the work.",
    swatch: "#2ecc71",
    card: "linear-gradient(180deg,#ecf0f1,#bdc3c7)",
    render: () => (
      <div className="mini-flat">
        <div className="mini-flat-tile green" />
        <div className="mini-flat-tile red" />
        <div className="mini-flat-tile blue" />
        <div className="mini-flat-tile yellow" />
      </div>
    ),
  },
  {
    slug: "material-design",
    name: "Material",
    era: "2014+",
    material: "Paper · Ink · Elevation",
    blurb: "Inspired by paper and ink. Strict elevation system, bold color, deliberate motion.",
    swatch: "#ff5722",
    card: "linear-gradient(180deg,#ffffff,#eceff1)",
    render: () => (
      <div className="mini-mat">
        <div className="mini-mat-fab" />
        <div className="mini-mat-card" />
        <div className="mini-mat-card" />
      </div>
    ),
  },
  {
    slug: "minimalism",
    name: "Minimalism",
    era: "timeless",
    material: "Whitespace · Type",
    blurb: "Only what is necessary. The interface disappears so the content can speak.",
    swatch: "#111111",
    card: "linear-gradient(180deg,#ffffff,#f4f4f4)",
    render: () => (
      <div className="mini-min">
        <div className="mini-min-line thick" />
        <div className="mini-min-line" />
        <div className="mini-min-line short" />
      </div>
    ),
  },
  {
    slug: "claymorphism",
    name: "Claymorphism",
    era: "2021+",
    material: "Inflated Clay · Pastel",
    blurb: "Soft, puffy, 3D-ish. Like sculpted clay with two inner shadows and an outer highlight.",
    swatch: "#ffb4a2",
    card: "linear-gradient(180deg,#ffe5d9,#ffddd2)",
    render: () => (
      <div className="mini-clay">
        <div className="mini-clay-ball" />
        <div className="mini-clay-ball" />
        <div className="mini-clay-ball" />
      </div>
    ),
  },
];

export default function InspoPage() {
  return (
    <main className="scene">
      <div className="vignette" />
      <div className="light-pool" />

      <div className="panel panel-wide">
        <Rivets />
        <BrassPlate
          title="DESIGN · INSPIRATIONS"
          sub="A FIELD GUIDE TO THE SCHOOLS OF UI"
        />

        <div className="inspo-grid">
          {styles.map((s, i) => (
            <div key={s.slug} className="inspo-card" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="inspo-swatch" style={{ background: s.card }}>
                {s.render()}
              </div>
              <div className="inspo-body">
                <div className="inspo-row">
                  <div className="inspo-name">{s.name}</div>
                  <div className="inspo-era">{s.era}</div>
                </div>
                <div className="inspo-material">{s.material}</div>
                <div className="inspo-blurb">{s.blurb}</div>
                <div className="inspo-foot">
                  <span className="inspo-chip" style={{ background: s.swatch }} />
                  <span className="inspo-slug">/{s.slug}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Strap />
      </div>

      <div className="caption">Inspo · A 1:1 reference index of the design families · built in the same system</div>
    </main>
  );
}
