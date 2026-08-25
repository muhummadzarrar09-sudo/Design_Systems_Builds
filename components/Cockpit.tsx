"use client";

import { useState } from "react";
import {
  Rivets,
  Gauge,
  Knob,
  Toggle,
  Switch,
  Led,
  BrassPlate,
  Strap,
  GlassTube,
  useTelemetry,
} from "./Skeuo";

export default function Cockpit() {
  const t = useTelemetry();
  const [vol, setVol] = useState(64);
  const [trim, setTrim] = useState(50);
  const [mix, setMix] = useState(40);

  const [t1, setT1] = useState(true);
  const [t2, setT2] = useState(true);
  const [t3, setT3] = useState(false);
  const [t4, setT4] = useState(true);

  const [s1, setS1] = useState(true);
  const [s2, setS2] = useState(false);
  const [s3, setS3] = useState(true);

  return (
    <main className="scene">
      <div className="vignette" />
      <div className="light-pool" />

      <div className="panel">
        <Rivets />
        <BrassPlate title="MISSION CONTROL · MK‑VII" sub="SKEUOMORPHIC INSTRUMENT PANEL · SERIAL 0042" />

        <div className="gauge-row">
          <Gauge label="ALTITUDE" value={t.alt * 50} unit="FT" min={0} max={5000} accent="#9bbf6a" />
          <Gauge label="AIRSPEED" value={t.spd * 5} unit="KTS" min={0} max={500} accent="#e9c46a" />
          <Gauge label="RPM" value={t.rpm * 40} unit="×100" min={0} max={4000} accent="#e76f51" />
        </div>

        <div className="mid-row">
          <div className="cluster">
            <div className="cluster-title">CONTROLS</div>
            <div className="knob-grid">
              <Knob label="VOL" value={vol} onChange={setVol} />
              <Knob label="TRIM" value={trim} onChange={setTrim} />
              <Knob label="MIX" value={mix} onChange={setMix} />
            </div>
          </div>

          <div className="cluster">
            <div className="cluster-title">TELEMETRY</div>
            <div className="glass-meters">
              <GlassTube label="FUEL" percent={t.fuel} color="amber" />
              <GlassTube label="OXY" percent={t.oxy} color="green" />
              <GlassTube label="HYD" percent={t.hyd} color="green" />
            </div>
          </div>

          <div className="cluster">
            <div className="cluster-title">HEADING</div>
            <div className="compass">
              <div className="compass-bezel">
                <div className="compass-card" style={{ transform: `rotate(${-t.heading}deg)` }}>
                  <span className="cdir n">N</span>
                  <span className="cdir e">E</span>
                  <span className="cdir s">S</span>
                  <span className="cdir w">W</span>
                  {Array.from({ length: 36 }).map((_, i) => (
                    <span
                      key={i}
                      className={`ctick ${i % 3 === 0 ? "major" : ""}`}
                      style={{ transform: `rotate(${i * 10}deg)` }}
                    />
                  ))}
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
          <div className="cluster">
            <div className="cluster-title">SYSTEMS</div>
            <div className="toggle-row">
              <Toggle label="AVIONICS" on={t1} onChange={() => setT1(!t1)} />
              <Toggle label="RADAR" on={t2} onChange={() => setT2(!t2)} />
              <Toggle label="AP" on={t3} onChange={() => setT3(!t3)} />
              <Toggle label="LIGHTS" on={t4} onChange={() => setT4(!t4)} />
            </div>
            <div className="led-row">
              <Led color="amber" on label="PWR" />
              <Led color="green" label="NAV" />
              <Led color="amber" on label="COM" />
              <Led color="green" label="FUEL" />
              <Led color="amber" label="OXY" />
              <Led color="green" label="HYD" />
            </div>
          </div>

          <div className="cluster">
            <div className="cluster-title">BREAKERS</div>
            <div className="switch-row">
              <Switch label="BAT" on={s1} onChange={() => setS1(!s1)} />
              <Switch label="GEN" on={s2} onChange={() => setS2(!s2)} />
              <Switch label="EXT" on={s3} onChange={() => setS3(!s3)} />
            </div>
            <div className="embossed-tag">CAUTION · DO NOT TOUCH IN FLIGHT</div>
          </div>
        </div>

        <Strap />

        <div className="corner-mark tl">A1</div>
        <div className="corner-mark tr">B2</div>
        <div className="corner-mark bl">C3</div>
        <div className="corner-mark br">D4</div>
      </div>

      <div className="caption">Skeuomorphic Cockpit · 1:1 reference build · Drag knobs · Click toggles</div>
    </main>
  );
}
