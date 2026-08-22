const LINE =
  "0,124 12,115 24,118 36,104 48,106 60,90 72,94 84,74 96,78 108,58 120,62 132,46 144,50 156,40 168,44 180,34 192,38 204,28 216,32 228,24 240,26 252,20 264,24 276,18 288,20 300,14 312,16 324,12 336,14 348,10 360,12 372,9 384,10 396,8 400,8";

/** Polished telemetry chart for the carousel slides. */
export default function ShowcaseChart() {
  const area = `${LINE} L400,150 L0,150 Z`;

  return (
    <div className="schart">
      <svg
        viewBox="0 0 400 150"
        className="schart-svg"
        role="img"
        aria-label="Altitude over the last 90 seconds, climbing toward the 450 km target"
      >
        {/* grid + labels */}
        <line x1="40" y1="40" x2="400" y2="40" className="schart-grid" />
        <line x1="40" y1="70" x2="400" y2="70" className="schart-grid" />
        <line x1="40" y1="100" x2="400" y2="100" className="schart-grid" />
        <line x1="40" y1="130" x2="400" y2="130" className="schart-grid" />
        <text x="4" y="44" className="schart-label">400</text>
        <text x="4" y="74" className="schart-label">300</text>
        <text x="4" y="104" className="schart-label">200</text>
        <text x="4" y="134" className="schart-label">100</text>
        <text x="340" y="152" className="schart-label">alt · km</text>

        {/* target line */}
        <line x1="40" y1="14" x2="400" y2="14" className="schart-target" />
        <text x="336" y="10" className="schart-label schart-label--target">
          target 450
        </text>

        <path d={area} className="schart-area" />
        <path d={`M${LINE}`} className="schart-line" pathLength={1} />
        <circle cx="400" cy="8" r="3.5" className="schart-dot" />
      </svg>
    </div>
  );
}
