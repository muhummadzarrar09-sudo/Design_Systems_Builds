"use client";

export function FlatPricing() {
  const plans = [
    { name: "Starter", price: "Free", features: ["1 Project", "Basic Analytics", "Community Support"] },
    { name: "Pro", price: "$19", features: ["Unlimited Projects", "Advanced Analytics", "Priority Support", "Custom Domain"] },
    { name: "Enterprise", price: "Custom", features: ["Everything in Pro", "Dedicated Manager", "SLA", "White Label"] },
  ];
  return (
    <section className="py-24 px-8" style={{ backgroundColor: "var(--bg)" }}>
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-black mb-2">Pricing</h2>
        <p className="text-sm mb-12" style={{ color: "var(--muted-fg)" }}>No hidden fees. No fine print. Just value.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div key={plan.name} className="p-8 text-left" style={{ backgroundColor: "var(--card)" }}>
              <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
              <p className="text-3xl font-black mb-6">{plan.price}</p>
              <ul className="space-y-3 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span style={{ color: "var(--accent)" }}>&#10003;</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className="w-full mt-8 py-3 text-sm font-bold uppercase tracking-wide"
                style={{ backgroundColor: "var(--primary)", color: "var(--primary-fg)" }}
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