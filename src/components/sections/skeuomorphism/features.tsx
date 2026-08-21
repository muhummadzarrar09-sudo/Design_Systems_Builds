"use client";

export function SkeuomorphismDashboard() {
  const items = [
    { label: "Documents", count: "23", icon: "📁" },
    { label: "Media", count: "156", icon: "📸" },
    { label: "Analytics", count: "89", icon: "📊" },
    { label: "Settings", count: "12", icon: "⚙️" },
  ];
  return (
    <section className="py-24 px-8" style={{ backgroundColor: "var(--muted)" }}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-black mb-8">Dashboard</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item.label}
              className="p-6 rounded-xl text-center"
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow), inset 0 1px 0 rgba(255,255,240,0.3)",
                borderRadius: "var(--radius-val)",
              }}
            >
              <span className="text-3xl mb-3 block">{item.icon}</span>
              <p className="text-2xl font-black">{item.count}</p>
              <p className="text-xs mt-1 font-medium" style={{ color: "var(--muted-fg)" }}>{item.label}</p>
            </div>
          ))}
        </div>
        {/* Progress bar */}
        <div className="mt-12 p-8 rounded-xl" style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1), 0 1px 0 rgba(255,255,240,0.3)",
        }}>
          <div className="flex justify-between mb-3 text-sm">
            <span className="font-bold">Storage Used</span>
            <span style={{ color: "var(--muted-fg)" }}>67%</span>
          </div>
          <div className="h-6 rounded-full" style={{
            backgroundColor: "var(--muted)",
            boxShadow: "inset 0 2px 3px rgba(0,0,0,0.15)",
          }}>
            <div className="h-full rounded-full" style={{
              width: "67%",
              background: "linear-gradient(180deg, var(--primary) 0%, #6a340d 100%)",
              boxShadow: "inset 0 1px 0 rgba(255,255,240,0.2)",
            }} />
          </div>
        </div>
      </div>
    </section>
  );
}