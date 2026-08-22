import type { StyleMeta } from "@/lib/styles";

/**
 * The Viewport: Earth + the Aurora-9 spacecraft on an inclined orbit,
 * over a per-language nebula. One structure, re-skinned per design
 * system via the theme--{slug} class + CSS tokens (like everything else).
 * All motion is CSS; see §12 VIEWPORT in globals.css.
 */
export default function SpaceViewport({ style }: { style: StyleMeta }) {
  return (
    <div
      className="viewport"
      role="img"
      aria-label={`Earth with the Aurora-9 spacecraft in orbit, rendered in ${style.name}`}
    >
      <i className="v-nebula v-nebula--a" aria-hidden="true" />
      <i className="v-nebula v-nebula--b" aria-hidden="true" />
      <i className="v-stars" aria-hidden="true" />

      <div className="v-scene" aria-hidden="true">
        <i className="v-orbit-ring" />

        <svg className="v-earth" viewBox="0 0 200 200">
          {/* atmosphere halo */}
          <circle className="v-atmo" cx="100" cy="100" r="70" />
          {/* the planet */}
          <circle className="v-earth-core" cx="100" cy="100" r="60" />
          {/* abstract landmasses */}
          <g className="v-land">
            <path d="M62 78c8-10 24-12 32-4 6 6 3 12 10 15 9 4 9 13 1 17-9 5-22 3-28-4-5-6-4-12-9-15-6-4-10-5-6-9Z" />
            <path d="M118 122c10-6 24-3 27 6 2 8-6 15-15 15-10 0-17-6-16-13 .1-3 1-6 4-8Z" />
          </g>
          {/* graticule: meridians + parallels */}
          <g className="v-grid">
            <ellipse cx="100" cy="100" rx="60" ry="60" />
            <ellipse cx="100" cy="100" rx="42" ry="60" />
            <ellipse cx="100" cy="100" rx="18" ry="60" />
            <line x1="40" y1="100" x2="160" y2="100" />
            <line x1="50" y1="78" x2="150" y2="78" />
            <line x1="50" y1="122" x2="150" y2="122" />
          </g>
          {/* night-side terminator */}
          <path
            className="v-terminator"
            d="M100 40a60 60 0 0 1 0 120 84 84 0 0 0 0-120Z"
          />
        </svg>

        {/* Aurora-9: rides a tilted elliptical orbit */}
        <div className="v-ship-orbit">
          <span className="v-ship">
            <i className="v-flame" />
          </span>
        </div>

        {/* a quiet second satellite, higher & slower */}
        <div className="v-moon-orbit">
          <i className="v-moon" />
        </div>
      </div>

      <span className="v-label">aurora-9 · leo 412 km · live</span>
    </div>
  );
}
