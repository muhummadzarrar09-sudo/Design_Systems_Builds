"use client";

export function MaterialFAQ() {
  const faqs = [
    { q: "What is Material Design?", a: "A design system created by Google that uses grid-based layouts, responsive animations, and depth effects like lighting and shadows to create a tactile, intuitive interface." },
    { q: "Why use elevation?", a: "Elevation helps users understand the hierarchy of elements. Higher elements are more important and appear closer to the user." },
    { q: "Is it only for Android?", a: "No. Material Design works across all platforms — web, iOS, Android, and desktop." },
    { q: "What is the 8dp grid?", a: "A consistent spacing system where all elements align to an 8dp baseline grid, ensuring visual rhythm and harmony." },
  ];
  return (
    <section className="py-24 px-8" style={{ backgroundColor: "var(--bg)" }}>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-black mb-8 text-center">Frequently Asked</h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <details key={faq.q} className="p-6 rounded" style={{ backgroundColor: "var(--card)", boxShadow: "var(--shadow-sm)" }}>
              <summary className="font-bold cursor-pointer">{faq.q}</summary>
              <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--muted-fg)" }}>{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}