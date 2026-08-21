"use client";

export function NeumorphismMedia() {
  return (
    <section className="py-24 px-8" style={{ backgroundColor: "var(--bg)" }}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-black mb-2 text-center">Media Gallery</h2>
        <p className="text-sm mb-12 text-center" style={{ color: "var(--muted-fg)" }}>Soft. Morphic. Tactile.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="aspect-square rounded-2xl flex items-center justify-center text-2xl"
              style={{
                backgroundColor: "var(--bg)",
                boxShadow: "var(--shadow)",
                borderRadius: "var(--radius-val)",
              }}
            >
              <span style={{ color: "var(--muted-fg)", opacity: 0.5 }}>{i}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function NeumorphismSettings() {
  const toggles = [
    { label: "Notifications", on: true },
    { label: "Dark Mode", on: false },
    { label: "Auto-Play", on: true },
    { label: "Sound Effects", on: false },
    { label: "Privacy Mode", on: true },
  ];
  return (
    <section className="py-24 px-8" style={{ backgroundColor: "var(--muted)" }}>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-black mb-8">Settings</h2>
        <div className="space-y-6">
          {toggles.map((t) => (
            <div
              key={t.label}
              className="flex items-center justify-between p-6 rounded-2xl"
              style={{
                backgroundColor: "var(--bg)",
                boxShadow: "var(--shadow)",
                borderRadius: "var(--radius-val)",
              }}
            >
              <span className="text-sm font-medium">{t.label}</span>
              <div
                className="w-14 h-8 rounded-full relative cursor-pointer"
                style={{
                  backgroundColor: t.on ? "var(--primary)" : "var(--muted)",
                  boxShadow: t.on ? "var(--shadow-sm)" : "inset var(--shadow-sm)",
                }}
              >
                <div
                  className="w-6 h-6 rounded-full absolute top-1 transition-all"
                  style={{
                    backgroundColor: "var(--bg)",
                    boxShadow: "var(--shadow-sm)",
                    left: t.on ? "28px" : "4px",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function NeumorphismProfile() {
  return (
    <section className="py-24 px-8" style={{ backgroundColor: "var(--bg)" }}>
      <div className="max-w-md mx-auto text-center">
        <div
          className="w-32 h-32 mx-auto rounded-full flex items-center justify-center text-4xl mb-6"
          style={{
            backgroundColor: "var(--bg)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          👤
        </div>
        <h2 className="text-2xl font-black">Alex Rivera</h2>
        <p className="text-sm mb-8" style={{ color: "var(--muted-fg)" }}>Product Designer</p>
        <div className="grid grid-cols-3 gap-4">
          {["Posts", "Followers", "Following"].map((label) => (
            <div
              key={label}
              className="p-4 rounded-2xl"
              style={{
                backgroundColor: "var(--bg)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <p className="text-lg font-black">—</p>
              <p className="text-xs mt-1" style={{ color: "var(--muted-fg)" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}