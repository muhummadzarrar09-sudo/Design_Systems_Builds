"use client";

export function ClaymorphismHero() {
  return (
    <section className="py-24 px-8 relative overflow-hidden" style={{ backgroundColor: "var(--bg)" }}>
      {/* Playful background shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
        <div className="absolute w-96 h-96 rounded-full -top-20 -right-20" style={{ backgroundColor: "var(--primary)" }} />
        <div className="absolute w-64 h-64 rounded-full bottom-10 -left-10" style={{ backgroundColor: "var(--accent)" }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <div
            className="inline-block px-6 py-3 mb-8 text-sm font-bold"
            style={{
              backgroundColor: "var(--card)",
              color: "var(--fg)",
              borderRadius: "var(--radius-val)",
              boxShadow: "var(--shadow)",
            }}
          >
            🏺 Squishy &amp; Sculptable
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.1] mb-6">
            Playful
            <br />
            <span style={{ color: "var(--primary)" }}>By Design.</span>
          </h1>

          <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: "var(--muted-fg)" }}>
            Bulging shapes, dual shadows, and vibrant colors that make every element feel like molded clay.
          </p>

          <div className="flex gap-4 justify-center">
            <button
              className="px-10 py-5 text-lg font-bold"
              style={{
                backgroundColor: "var(--primary)",
                color: "var(--primary-fg)",
                borderRadius: "var(--radius-val)",
                boxShadow: "var(--shadow)",
              }}
            >
              Squish It
            </button>
            <button
              className="px-10 py-5 text-lg font-bold"
              style={{
                backgroundColor: "var(--card)",
                color: "var(--fg)",
                borderRadius: "var(--radius-val)",
                boxShadow: "var(--shadow)",
              }}
            >
              Mold It
            </button>
          </div>
        </div>

        {/* Clay card row */}
        <div className="grid grid-cols-3 gap-6 mt-16 max-w-2xl mx-auto">
          {["🌸", "⭐", "🌈"].map((emoji, i) => (
            <div
              key={i}
              className="p-8 text-center"
              style={{
                backgroundColor: "var(--card)",
                borderRadius: "var(--radius-val)",
                boxShadow: "var(--shadow)",
                transform: i === 1 ? "translateY(-12px)" : "none",
              }}
            >
              <span className="text-4xl">{emoji}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ClaymorphismPricing() {
  const plans = [
    { name: "Starter", price: "$9", color: "var(--primary)" },
    { name: "Pro", price: "$29", color: "var(--accent)" },
    { name: "Studio", price: "$79", color: "var(--secondary)" },
  ];
  return (
    <section className="py-24 px-8" style={{ backgroundColor: "var(--secondary)" }}>
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-black mb-2">Plans</h2>
        <p className="text-sm mb-12" style={{ color: "var(--muted-fg)" }}>Pick your shape.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="p-8"
              style={{
                backgroundColor: "var(--card)",
                borderRadius: "var(--radius-val)",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
              <p className="text-4xl font-black mb-6" style={{ color: plan.color }}>{plan.price}</p>
              <button
                className="w-full py-4 text-sm font-bold"
                style={{
                  backgroundColor: plan.color,
                  color: "#fff",
                  borderRadius: "var(--radius-val)",
                  boxShadow: "var(--shadow)",
                }}
              >
                Choose {plan.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}