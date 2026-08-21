"use client";

export function MinimalismHero() {
  return (
    <section className="py-24 px-8 max-w-7xl mx-auto">
      <div className="max-w-4xl mx-auto text-center">
        <span className="text-xs tracking-[0.3em] uppercase font-medium" style={{ color: "var(--muted-fg)" }}>
          Established 2026
        </span>
        <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter mt-8 leading-[0.9]">
          Design
          <br />
          <span style={{ color: "var(--accent)" }}>Without</span>
          <br />
          Excess.
        </h1>
        <p className="text-lg sm:text-xl mt-8 max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--muted-fg)" }}>
          Every pixel serves a purpose. No decoration, no distraction — just clear communication through typography, space, and intent.
        </p>
        <div className="flex gap-4 justify-center mt-10">
          <button
            className="px-8 py-3 text-sm font-semibold uppercase tracking-wider"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--primary-fg)",
            }}
          >
            Get Started
          </button>
          <button
            className="px-8 py-3 text-sm font-semibold uppercase tracking-wider"
            style={{
              border: "1px solid var(--border)",
              color: "var(--fg)",
            }}
          >
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
}

export function MinimalismBenefits() {
  const benefits = [
    { number: "01", title: "Intentional Design", desc: "Every element earns its place. Nothing is added without purpose." },
    { number: "02", title: "Crystal Clarity", desc: "Typography and hierarchy do the heavy lifting — no ornament needed." },
    { number: "03", title: "Timeless Aesthetic", desc: "Trends fade. Minimalism endures. Your brand stays relevant." },
  ];

  return (
    <section className="py-24 px-8 max-w-7xl mx-auto border-t" style={{ borderColor: "var(--border)" }}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
        {benefits.map((b) => (
          <div key={b.number}>
            <span className="text-5xl font-black" style={{ color: "var(--muted-fg)", opacity: 0.3 }}>{b.number}</span>
            <h3 className="text-xl font-bold mt-4 mb-3">{b.title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted-fg)" }}>{b.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
