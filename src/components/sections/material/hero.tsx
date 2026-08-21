"use client";

export function MaterialHero() {
  return (
    <section className="py-24 px-8 relative overflow-hidden" style={{ backgroundColor: "var(--bg)" }}>
      {/* Elevation layers */}
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div
              className="inline-block px-4 py-2 text-xs font-medium uppercase tracking-widest mb-6 rounded-sm"
              style={{
                backgroundColor: "var(--secondary)",
                color: "var(--secondary-fg)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              Material Design
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.1] mb-6">
              Purposeful
              <br />
              <span style={{ color: "var(--primary)" }}>Motion.</span>
              <br />
              Tangible
              <span style={{ color: "var(--accent)" }}>.</span>
            </h1>
            <p className="text-lg mb-8 max-w-md leading-relaxed" style={{ color: "var(--muted-fg)" }}>
              Surfaces at rest. Elevation on interaction. Every shadow tells a story of depth and hierarchy.
            </p>
            <div className="flex gap-4">
              <button
                type="button"
                className="px-8 py-4 text-sm font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "var(--primary-fg)",
                  boxShadow: "var(--shadow)",
                  borderRadius: "var(--radius-val)",
                }}
              >
                Get Started
              </button>
              <button
                type="button"
                className="px-8 py-4 text-sm font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: "transparent",
                  color: "var(--primary)",
                  borderRadius: "var(--radius-val)",
                }}
              >
                Watch Video
              </button>
            </div>
          </div>
          {/* Material Card Stack */}
          <div className="relative h-96">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="absolute p-6 rounded-xl w-72"
                style={{
                  backgroundColor: "var(--card)",
                  boxShadow: i === 0 ? "var(--shadow-lg)" : i === 1 ? "var(--shadow)" : "var(--shadow-sm)",
                  top: `${i * 20}px`,
                  left: `${i * 20}px`,
                  zIndex: 3 - i,
                  borderLeft: i === 0 ? `4px solid var(--primary)` : "none",
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full" style={{ backgroundColor: "var(--primary)" }} />
                  <div>
                    <p className="text-sm font-bold">Card {i + 1}</p>
                    <p className="text-xs" style={{ color: "var(--muted-fg)" }}>Elevation {i + 1}</p>
                  </div>
                </div>
                <div className="h-2 rounded mb-2" style={{ backgroundColor: "var(--muted)", width: "75%" }} />
                <div className="h-2 rounded mb-2" style={{ backgroundColor: "var(--muted)", width: "50%" }} />
                <div className="h-2 rounded" style={{ backgroundColor: "var(--muted)", width: "60%" }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function MaterialFeatures() {
  const features = [
    { icon: "▦", title: "Elevation", desc: "Every component sits at a specific height. Shadows communicate depth naturally." },
    { icon: "⬡", title: "Ripple Effect", desc: "Touch feedback that radiates from the point of contact. Instant and satisfying." },
    { icon: "▣", title: "Grid System", desc: "8dp grid. Consistent spacing. Predictable layouts across every screen size." },
    { icon: "◈", title: "Color System", desc: "Primary, secondary, surface, background. A systematic approach to color." },
  ];
  return (
    <section className="py-24 px-8" style={{ backgroundColor: "var(--secondary)" }}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-black mb-8 text-center">Core Principles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="p-6" style={{ backgroundColor: "var(--card)", boxShadow: "var(--shadow-sm)" }}>
              <span className="text-3xl mb-4 block">{f.icon}</span>
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-sm" style={{ color: "var(--muted-fg)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}