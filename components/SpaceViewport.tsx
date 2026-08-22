import type { StyleMeta } from "@/lib/styles";

/**
 * Earth + Aurora-9. Recognizable continents, a real elliptical orbit,
 * restyled by the parent .theme--* so each language gets a different planet.
 */
export default function SpaceViewport({ style }: { style: StyleMeta }) {
  const uid = `globe-${style.slug}`;

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
        <i className="v-orbit-tube" />

        <svg className="v-earth" viewBox="0 0 200 200">
          <defs>
            <clipPath id={`${uid}-clip`}>
              <circle cx="100" cy="100" r="64" />
            </clipPath>
            <radialGradient id={`${uid}-ocean`} cx="36%" cy="30%" r="72%">
              <stop offset="0%" stopColor="var(--v-ocean-0, #2a7ea0)" />
              <stop offset="55%" stopColor="var(--v-ocean-1, #16485c)" />
              <stop offset="100%" stopColor="var(--v-ocean-2, #0b1c28)" />
            </radialGradient>
            <radialGradient id={`${uid}-shade`} cx="34%" cy="28%" r="74%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.22" />
              <stop offset="42%" stopColor="#fff" stopOpacity="0" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.5" />
            </radialGradient>
          </defs>

          <circle className="v-atmo" cx="100" cy="100" r="74" />
          <circle
            className="v-earth-core"
            cx="100"
            cy="100"
            r="64"
            fill={`url(#${uid}-ocean)`}
          />

          <g clipPath={`url(#${uid}-clip)`}>
            {/* Africa-facing — glass, clay, skeu, neu, flat, minimal */}
            <g className="v-land v-land--af">
              <path d="M98 66c10-2 18 2 20 10 4 6 14 10 16 20 2 8-6 12-12 16-2 12-6 26-12 36-4 6-12 4-14-4-4-12-6-24-12-32-10-6-14-16-10-26 4-10 12-18 24-20z" />
              <path d="M97 51c7-4.5 18-3 21 4 2.5 5-3 10-10.5 10.5-6.5.4-12-3.5-12.5-8.5-.3-2.4.4-4.4 1.5-6z" />
              <path d="M90 53c3-2 6-1 6 2s-3 4-5 3-2.4-3.2-1-5z" />
              <path d="M124 74c8.5-2.5 16 3.5 14.5 12-1.5 7-8 8-12.5 2.5-4-4.5-4.5-10.5-2-14.5z" />
              <path d="M122 55c16-11 38-7 45 10 6.5 14-2 25.5-16 24-11-1.2-20-11-24.5-21.5-2.2-5-3-9-4.5-12.5z" />
              <path d="M144 90c7-2.5 12.5 3 10.5 11.5-1.8 7-8.5 6-11-1-2.4-6.5-1.4-11.5.5-10.5z" />
              <path d="M126 124c4.5-2.2 7.5 3.5 5.5 10.5-1.8 5-6.8 3.2-7.2-1.5-.4-4.2.2-7.5 1.7-9z" />
              <path d="M40 68c12-16 34-14 43 1 7 11.5 3 25-8 32-10 6.5-22 4.5-29-5.5C38 86 32 78 40 68z" />
              <path d="M58 98c8 1.5 12 10 8 17.5-4 6.5-11 4-12.5-3-1.4-6.2 1-13 4.5-14.5z" />
              <path d="M52 104c10-5 18 2 18.5 14.5.6 15-4 29.5-11.5 40-6.5 7.5-14.5 2-15-10.5C43 132 43 114 52 104z" />
              <path d="M68 44c8-6.5 18-3 17 5.5-1.2 5.5-9 5-13.5 1.5-4-3-5.5-5.2-3.5-7z" />
            </g>

            {/* Americas-facing — Material illustration */}
            <g className="v-land v-land--am">
              <path d="M68 52c14-15 42-14 54 4 8 12.5 3 30-10 39-11 7.5-26 6-35-6C65 76 58 62 68 52z" />
              <path d="M92 100c13-5 23 5 22 20-1.2 17-8 33-17.5 42-9 7-16.5-2-16-16 .6-16 4-36 11.5-46z" />
              <path d="M78 46c8-7 18-3 17 5-1 5.5-9 5-14 1.5-4-2.8-5.4-4.6-3-6.5z" />
            </g>

            <g className="v-cloud">
              <ellipse cx="78" cy="72" rx="16" ry="6" />
              <ellipse cx="128" cy="90" rx="18" ry="5.5" />
              <ellipse cx="96" cy="128" rx="14" ry="5" />
              <ellipse cx="60" cy="108" rx="10" ry="4" />
            </g>
            <ellipse className="v-ice v-ice--n" cx="100" cy="42" rx="22" ry="10" />
            <ellipse className="v-ice v-ice--s" cx="100" cy="158" rx="20" ry="9" />

            <g className="v-grid">
              <ellipse cx="100" cy="100" rx="64" ry="64" />
              <ellipse cx="100" cy="100" rx="44" ry="64" />
              <ellipse cx="100" cy="100" rx="20" ry="64" />
              <line x1="36" y1="100" x2="164" y2="100" />
              <line x1="44" y1="74" x2="156" y2="74" />
              <line x1="44" y1="126" x2="156" y2="126" />
            </g>

            <path
              className="v-terminator"
              d="M100 36a64 64 0 0 1 0 128 90 90 0 0 0 0-128Z"
            />
            <circle
              className="v-shade"
              cx="100"
              cy="100"
              r="64"
              fill={`url(#${uid}-shade)`}
            />
          </g>
        </svg>

        <div className="v-ship-orbit">
          <span className="v-ship">
            <i className="v-sat-panel" />
            <i className="v-flame" />
          </span>
        </div>

        <i className="v-pin v-pin--a" />
        <i className="v-pin v-pin--b" />
        <i className="v-pin v-pin--c" />

        <span className="v-tag v-tag--launch">Launch</span>
        <span className="v-tag v-tag--orbit">Orbit 1</span>

        <div className="v-moon-orbit">
          <i className="v-moon" />
        </div>
      </div>

      <span className="v-label">aurora-9 · leo 412 km · live</span>
    </div>
  );
}
