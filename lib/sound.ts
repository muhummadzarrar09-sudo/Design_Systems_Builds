// Tiny mechanical click synth — no assets, created lazily on first user gesture.

let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** Short mechanical click (button press, toggle throw, knob detent). */
export function click(kind: "button" | "toggle" | "detent" = "button") {
  const c = ac();
  if (!c) return;
  const t = c.currentTime;
  const o = c.createOscillator();
  const g = c.createGain();
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  if (kind === "button") {
    o.type = "square";
    o.frequency.setValueAtTime(2400, t);
    o.frequency.exponentialRampToValueAtTime(700, t + 0.03);
    f.frequency.value = 2200;
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  } else if (kind === "toggle") {
    o.type = "square";
    o.frequency.setValueAtTime(1500, t);
    o.frequency.exponentialRampToValueAtTime(400, t + 0.05);
    f.frequency.value = 1400;
    g.gain.setValueAtTime(0.14, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
  } else {
    o.type = "triangle";
    o.frequency.setValueAtTime(3200, t);
    f.frequency.value = 3200;
    g.gain.setValueAtTime(0.045, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
  }
  o.connect(f).connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + 0.09);
}
