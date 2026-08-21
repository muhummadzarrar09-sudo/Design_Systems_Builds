"use client";

export function FlatHero() {
  return (
    <section className="py-24 px-8" style={{ backgroundColor: "var(--bg)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div
              className="inline-block px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-6"
              style={{ backgroundColor: "var(--primary)", color: "var(--primary-fg)" }}
            >
              Bold &amp; Purposeful
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] mb-6">
              Color.
              <br />
              <span style={{ color: "var(--primary)" }}>Shape.</span>
              <br />
              Function.
            </h1>
            <p className="text-lg mb-8 max-w-md" style={{ color: "var(--muted-fg)" }}>
              No gradients. No shadows. Decoration has a job. Flat design strips away the unnecessary to let content breathe.
            </p>
            <div className="flex gap-3">
              <button
                className="px-8 py-4 text-base font-bold uppercase tracking-wide"
                style={{ backgroundColor: "var(--primary)", color: "var(--primary-fg)" }}
              >
                Start Now
              </button>
              <button
                className="px-8 py-4 text-base font-bold uppercase tracking-wide"
                style={{ border: "3px solid var(--fg)", color: "var(--fg)" }}
              >
                Learn More
              </button>
            </div>
          </div>
          <div className="relative">
            <div
              className="grid grid-cols-2 gap-4 p-6"
              style={{ backgroundColor: "var(--secondary)" }}
            >
              {["01", "02", "03", "04"].map((n) => (
                <div key={n} className="p-8 text-center" style={{ backgroundColor: "var(--card)" }}>
                  <span className="text-4xl font-black" style={{ color: "var(--primary)" }}>{n}</span>
                  <p className="text-sm mt-2 font-bold uppercase tracking-wider" style={{ color: "var(--fg)" }}>
                    Module {n}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FlatStats() {
  const stats = [
    { number: "99%", label: "Uptime" },
    { number: "12M+", label: "Users" },
    { number: "150+", label: "Countries" },
    { number: "4.9", label: "Rating" },
  ];
  return (
    <section className="py-16 px-8" style={{ backgroundColor: "var(--primary)", color: "var(--primary-fg)" }}>
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-4xl sm:text-5xl font-black">{s.number}</p>
            <p className="text-sm mt-2 font-bold uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FlatTeam() {
  const members = [
    { name: "Ana K.", role: "Creative Director", color: "#e17055" },
    { name: "Marcus L.", role: "Lead Developer", color: "#00b894" },
    { name: "Yuki T.", role: "Designer", color: "#0984e3" },
    { name: "Priya S.", role: "Strategist", color: "#fdcb6e" },
  ];
  return (
    <section className="py-24 px-8" style={{ backgroundColor: "var(--secondary)" }}>
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-black mb-2">The Team</h2>
        <p className="text-sm mb-12" style={{ color: "var(--muted-fg)" }}>Flat, honest, direct.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {members.map((m) => (
            <div key={m.name} className="p-8" style={{ backgroundColor: "var(--card)" }}>
              <div className="w-20 h-20 mx-auto mb-4" style={{ backgroundColor: m.color }} />
              <h3 className="text-lg font-bold">{m.name}</h3>
              <p className="text-xs font-bold uppercase tracking-wider mt-1" style={{ color: "var(--muted-fg)" }}>{m.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}