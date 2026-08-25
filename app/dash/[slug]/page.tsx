"use client";

import { useState } from "react";
import { useParams, notFound } from "next/navigation";
import {
  Rivets,
  BrassPlate,
  Strap,
  Knob,
  Toggle,
  Switch,
  Led,
  GlassTube,
  Gauge,
  useTelemetry,
} from "@/components/Skeuo";

type Theme = {
  name: string;
  sub: string;
  panelBg: string;
  cardBg: string;
  brassText: string;
  fontStack: string;
  gauges?: boolean;
};

const themes: Record<string, Theme> = {
  skeuomorphism: {
    name: "SKEUOMORPHISM",
    sub: "REFERENCE · 1:1 FROM THE AI RENDER",
    panelBg: "",
    cardBg: "linear-gradient(180deg,#3a3025 0%,#2a2018 100%)",
    brassText: "MISSION CONTROL · MK‑VII",
    fontStack: '"Courier New", monospace',
    gauges: true,
  },
  glassmorphism: {
    name: "GLASSMORPHISM",
    sub: "FROSTED LAYER · BACKDROP BLUR",
    panelBg: "",
    cardBg:
      "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 100%)",
    brassText: "GLASS · ORBITAL DECK",
    fontStack: '"Inter", system-ui, sans-serif',
  },
  neumorphism: {
    name: "NEUMORPHISM",
    sub: "EMBOSSED FROM A SINGLE SURFACE",
    panelBg: "",
    cardBg: "linear-gradient(180deg,#e8eaed,#c8ccd0)",
    brassText: "NEUMO · CLAY DECK",
    fontStack: '"Inter", system-ui, sans-serif',
  },
};

export default function DashPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug as string;
  const theme = themes[slug];
  if (!theme) {
    if (typeof window !== "undefined") {
      // soft fallback rather than crash during dev
    }
    return <NotFoundState slug={slug} />;
  }

  const t = useTelemetry();
  const [vol, setVol] = useState(64);
  const [trim, setTrim] = useState(50);
  const [mix, setMix] = useState(40);

  const isGlass = slug === "glassmorphism";
  const isNeumo = slug === "neumorphism";

  return (
    <main className="scene">
      <div className="vignette" />
      <div className="light-pool" />

      <div className={`panel ${isGlass ? "panel-glass" : isNeumo ? "panel-neumo" : ""}`}>
        <Rivets />
        <BrassPlate title={theme.brassText} sub={theme.sub} />

        <div className="gauge-row">
          <Gauge label="ALTITUDE" value={t.alt * 50} unit="FT" accent="#9bbf6a" />
          <Gauge label="AIRSPEED" value={t.spd * 5} unit="KTS" accent="#e9c46a" />
          <Gauge label="RPM" value={t.rpm * 40} unit="×100" accent="#e76f51" />
        </div>

        <div className="mid-row">
          <div className={`cluster ${isGlass ? "cluster-glass" : isNeumo ? "cluster-neumo" : ""}`}>
            <div className="cluster-title">CONTROLS</div>
            <div className="knob-grid">
              <Knob label="VOL" value={vol} onChange={setVol} />
              <Knob label="TRIM" value={trim} onChange={setTrim} />
              <Knob label="MIX" value={mix} onChange={setMix} />
            </div>
          </div>

          <div className={`cluster ${isGlass ? "cluster-glass" : isNeumo ? "cluster-neumo" : ""}`}>
            <div className="cluster-title">TELEMETRY</div>
            <div className="glass-meters">
              <GlassTube label="FUEL" percent={t.fuel} color="amber" />
              <GlassTube label="OXY" percent={t.oxy} color="green" />
              <GlassTube label="HYD" percent={t.hyd} color="green" />
            </div>
          </div>

          <div className={`cluster ${isGlass ? "cluster-glass" : isNeumo ? "cluster-neumo" : ""}`}>
            <div className="cluster-title">HEADING</div>
            <div className="compass">
              <div className="compass-bezel">
                <div className="compass-card" style={{ transform: `rotate(${-t.heading}deg)` }}>
                  <span className="cdir n">N</span>
                  <span className="cdir e">E</span>
                  <span className="cdir s">S</span>
                  <span className="cdir w">W</span>
                </div>
                <div className="compass-needle" />
                <div className="compass-cap" />
                <div className="compass-glare" />
              </div>
            </div>
            <div className="heading-readout">{Math.round(t.heading).toString().padStart(3, "0")}°</div>
          </div>
        </div>

        <div className="bottom-row">
          <div className={`cluster ${isGlass ? "cluster-glass" : isNeumo ? "cluster-neumo" : ""}`}>
            <div className="cluster-title">SYSTEMS</div>
            <div className="toggle-row">
              <Toggle label="AVIONICS" on={true} onChange={() => {}} />
              <Toggle label="RADAR" on={true} onChange={() => {}} />
              <Toggle label="AP" on={false} onChange={() => {}} />
              <Toggle label="LIGHTS" on={true} onChange={() => {}} />
            </div>
            <div className="led-row">
              <Led color="amber" on label="PWR" />
              <Led color="green" label="NAV" />
              <Led color="amber" on label="COM" />
              <Led color="green" label="FUEL" />
            </div>
          </div>
          <div className={`cluster ${isGlass ? "cluster-glass" : isNeumo ? "cluster-neumo" : ""}`}>
            <div className="cluster-title">BREAKERS</div>
            <div className="switch-row">
              <Switch label="BAT" on={true} onChange={() => {}} />
              <Switch label="GEN" on={false} onChange={() => {}} />
              <Switch label="EXT" on={true} onChange={() => {}} />
            </div>
            <div className="embossed-tag">VARIANT · {theme.name}</div>
          </div>
        </div>

        <Strap />
      </div>

      <div className="caption">
        Dashboard variant · <code>/dash/{slug}</code> · same components, different shell
      </div>
    </main>
  );
}

function NotFoundState({ slug }: { slug: string }) {
  return (
    <main className="scene">
      <div className="vignette" />
      <div className="panel">
        <Rivets />
        <BrassPlate title="UNKNOWN VARIANT" sub={`NO THEME FOUND FOR /${slug}`} />
        <div style={{ padding: 24, textAlign: "center", color: "#b89a6a" }}>
          <p>Try one of: <code>/dash/skeuomorphism</code>, <code>/dash/glassmorphism</code>, <code>/dash/neumorphism</code></p>
        </div>
        <Strap />
      </div>
    </main>
  );
}
