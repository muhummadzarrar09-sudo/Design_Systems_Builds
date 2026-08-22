const POINTS = "0,33 10,30 20,31 30,26 40,27 50,22 60,24 70,18 80,20 90,13 100,10";

/** Altitude-over-time telemetry chart. Pure SVG, styled per design system. */
export default function TrajectoryChart() {
  const area = `${POINTS} L100,40 L0,40 Z`;

  return (
    <div className="chart">
      <svg
        viewBox="0 0 100 40"
        className="chart-svg"
        preserveAspectRatio="none"
        role="img"
        aria-label="Altitude over the last 90 seconds"
      >
        <line x1="0" y1="10" x2="100" y2="10" className="chart-grid" vectorEffect="non-scaling-stroke" />
        <line x1="0" y1="20" x2="100" y2="20" className="chart-grid" vectorEffect="non-scaling-stroke" />
        <line x1="0" y1="30" x2="100" y2="30" className="chart-grid" vectorEffect="non-scaling-stroke" />
        <path d={area} className="chart-area" />
        <path d={`M${POINTS}`} className="chart-line" pathLength={1} />
      </svg>
    </div>
  );
}
