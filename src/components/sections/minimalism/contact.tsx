"use client";

export function MinimalismContact() {
  return (
    <section className="py-24 px-8" style={{ backgroundColor: "var(--secondary)" }}>
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-black mb-2">Get in Touch</h2>
        <p className="text-sm mb-12" style={{ color: "var(--muted-fg)" }}>Say hello. Keep it simple.</p>
        <div className="space-y-4 text-left">
          <input
            placeholder="Your email"
            className="w-full px-6 py-4 text-sm border"
            style={{ backgroundColor: "var(--bg)", color: "var(--fg)", borderColor: "var(--border)", borderRadius: "var(--radius-val)" }}
          />
          <textarea
            placeholder="Your message"
            rows={4}
            className="w-full px-6 py-4 text-sm border"
            style={{ backgroundColor: "var(--bg)", color: "var(--fg)", borderColor: "var(--border)", borderRadius: "var(--radius-val)" }}
          />
          <button
            className="px-8 py-4 text-sm font-semibold uppercase tracking-wider"
            style={{ backgroundColor: "var(--primary)", color: "var(--primary-fg)" }}
          >
            Send Message
          </button>
        </div>
      </div>
    </section>
  );
}

export function MinimalismGallery() {
  const items = ["◻", "◼", "◻", "◼", "◻", "◼"];
  return (
    <section className="py-24 px-8" style={{ backgroundColor: "var(--bg)" }}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-black mb-2">Selected Works</h2>
        <p className="text-sm mb-12" style={{ color: "var(--muted-fg)" }}>A curated collection.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-px" style={{ backgroundColor: "var(--border)" }}>
          {items.map((item, i) => (
            <div key={i} className="aspect-square flex items-center justify-center text-6xl" style={{ backgroundColor: "var(--bg)" }}>
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}