"use client";

export function GlassmorphismFeatures() {
  const features = [
    { title: "Backdrop Blur", desc: "Frosted glass effect that creates depth while keeping content readable." },
    { title: "Layered Depth", desc: "Multiple transparent layers stacked to create a rich spatial experience." },
    { title: "Light Borders", desc: "Subtle translucent borders define edges without breaking the glass illusion." },
    { title: "Vibrant Accents", desc: "Bold accent colors pierce through the frost for interactive elements." },
  ];
  return (
    <section className="py-24 px-8 relative overflow-hidden" style={{
      background: "linear-gradient(135deg, #1a1b2f 0%, #2d1b69 50%, #1a1b2f 100%)",
    }}>
      <div className="max-w-7xl mx-auto relative z-10">
        <h2 className="text-3xl sm:text-4xl font-black mb-8 text-center" style={{ color: "rgba(255,255,255,0.9)" }}>
          Glass Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="p-6 rounded-2xl backdrop-blur-xl"
              style={{
                backgroundColor: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <h3 className="text-lg font-bold mb-2" style={{ color: "rgba(255,255,255,0.9)" }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function GlassmorphismPricing() {
  const plans = [
    { name: "Starter", price: "Free", popular: false },
    { name: "Pro", price: "$19", popular: true },
    { name: "Enterprise", price: "Custom", popular: false },
  ];
  return (
    <section className="py-24 px-8 relative overflow-hidden" style={{
      background: "linear-gradient(135deg, #2d1b69 0%, #1a1b2f 50%, #2d1b69 100%)",
    }}>
      <div className="max-w-7xl mx-auto relative z-10">
        <h2 className="text-3xl sm:text-4xl font-black mb-8 text-center" style={{ color: "rgba(255,255,255,0.9)" }}>
          Transparent Pricing
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="p-8 rounded-2xl backdrop-blur-xl text-center"
              style={{
                backgroundColor: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                transform: plan.popular ? "scale(1.05)" : "none",
              }}
            >
              <h3 className="text-lg font-bold mb-1" style={{ color: "rgba(255,255,255,0.9)" }}>{plan.name}</h3>
              <p className="text-4xl font-black mb-6" style={{ color: "rgba(255,255,255,0.9)" }}>{plan.price}</p>
              <button
                className="w-full py-3 text-sm font-bold rounded-xl"
                style={{
                  backgroundColor: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.2)",
                  backdropFilter: "blur(10px)",
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