"use client";

import { useState } from "react";
import { Rivets, BrassPlate, Strap, Knob, Toggle, Switch, Led, GlassTube, Gauge } from "@/components/Skeuo";

export default function LabPage() {
  const [vol, setVol] = useState(72);
  const [pan, setPan] = useState(50);
  const [gain, setGain] = useState(40);
  const [treb, setTreb] = useState(60);
  const [bass, setBass] = useState(35);
  const [mid, setMid] = useState(55);

  const [t1, setT1] = useState(true);
  const [t2, setT2] = useState(false);
  const [t3, setT3] = useState(true);
  const [t4, setT4] = useState(true);
  const [t5, setT5] = useState(false);
  const [t6, setT6] = useState(false);

  const [s1, setS1] = useState(true);
  const [s2, setS2] = useState(true);
  const [s3, setS3] = useState(false);
  const [s4, setS4] = useState(true);
  const [s5, setS5] = useState(true);

  return (
    <main className="scene">
      <div className="vignette" />
      <div className="light-pool" />

      <div className="panel panel-wide">
        <Rivets />
        <BrassPlate title="INTERACTION · LABORATORY" sub="EXPERIMENT 014 · COMPONENT PLAYGROUND" />

        {/* Knobs playground */}
        <div className="lab-section">
          <div className="lab-section-title">A · ROTARY CONTROLS</div>
          <div className="lab-knob-row">
            <Knob label="VOL" value={vol} onChange={setVol} />
            <Knob label="PAN" value={pan} onChange={setPan} />
            <Knob label="GAIN" value={gain} onChange={setGain} />
            <Knob label="TREB" value={treb} onChange={setTreb} />
            <Knob label="MID" value={mid} onChange={setMid} />
            <Knob label="BASS" value={bass} onChange={setBass} />
            <Knob label="REVERB" value={25} onChange={() => {}} />
            <Knob label="DELAY" value={12} onChange={() => {}} />
          </div>
          <div className="lab-hint">Drag around the ring · double-click to center</div>
        </div>

        {/* Gauges playground */}
        <div className="lab-section">
          <div className="lab-section-title">B · GAUGES</div>
          <div className="lab-gauge-row">
            <Gauge label="SIGNAL" value={vol * 1.2} unit="dB" accent="#9bbf6a" />
            <Gauge label="OUTPUT" value={gain * 1.5} unit="W" accent="#e9c46a" />
            <Gauge label="PEAK" value={treb * 1.1} unit="dB" accent="#e76f51" />
          </div>
        </div>

        {/* Glass tubes */}
        <div className="lab-section">
          <div className="lab-section-title">C · GLASS INDICATORS</div>
          <div className="lab-glass-row">
            <GlassTube label="INPUT" percent={vol} color="amber" />
            <GlassTube label="PROCESS" percent={mid} color="green" />
            <GlassTube label="OUTPUT" percent={treb} color="amber" />
            <GlassTube label="HEADROOM" percent={100 - gain} color="green" />
          </div>
        </div>

        {/* Toggles */}
        <div className="lab-section">
          <div className="lab-section-title">D · ROCKER SWITCHES</div>
          <div className="lab-toggle-row">
            <Toggle label="48V" on={t1} onChange={() => setT1(!t1)} />
            <Toggle label="PAD" on={t2} onChange={() => setT2(!t2)} />
            <Toggle label="LO-CUT" on={t3} onChange={() => setT3(!t3)} />
            <Toggle label="PHASE" on={t4} onChange={() => setT4(!t4)} />
            <Toggle label="LINK" on={t5} onChange={() => setT5(!t5)} />
            <Toggle label="MUTE" on={t6} onChange={() => setT6(!t6)} />
          </div>
        </div>

        {/* Switches */}
        <div className="lab-section">
          <div className="lab-section-title">E · CIRCUIT BREAKERS</div>
          <div className="lab-switch-row">
            <Switch label="CH 1" on={s1} onChange={() => setS1(!s1)} />
            <Switch label="CH 2" on={s2} onChange={() => setS2(!s2)} />
            <Switch label="CH 3" on={s3} onChange={() => setS3(!s3)} />
            <Switch label="CH 4" on={s4} onChange={() => setS4(!s4)} />
            <Switch label="AUX" on={s5} onChange={() => setS5(!s5)} />
          </div>
        </div>

        {/* LEDs */}
        <div className="lab-section">
          <div className="lab-section-title">F · STATUS LEDS</div>
          <div className="lab-led-grid">
            <div className="lab-led-group">
              <div className="lab-led-group-title">AMBER</div>
              <div className="lab-led-row">
                <Led color="amber" on />
                <Led color="amber" on />
                <Led color="amber" />
                <Led color="amber" on />
                <Led color="amber" />
              </div>
            </div>
            <div className="lab-led-group">
              <div className="lab-led-group-title">GREEN</div>
              <div className="lab-led-row">
                <Led color="green" on />
                <Led color="green" on />
                <Led color="green" on />
                <Led color="green" />
                <Led color="green" on />
              </div>
            </div>
            <div className="lab-led-group">
              <div className="lab-led-group-title">RED</div>
              <div className="lab-led-row">
                <Led color="red" />
                <Led color="red" on />
                <Led color="red" />
                <Led color="red" />
                <Led color="red" />
              </div>
            </div>
          </div>
        </div>

        <Strap />
      </div>

      <div className="caption">Lab · A playground for every component in the system</div>
    </main>
  );
}
