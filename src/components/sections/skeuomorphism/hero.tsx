"use client";

export function SkeuomorphismHero() {
  return (
    <section
      className="py-24 px-8 relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, var(--card) 0%, var(--bg) 100%)",
        borderBottom: "2px solid var(--border)",
      }}
    >
      {/* Decorative texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, var(--fg) 2px, var(--fg) 3px)",
          pointerEvents: "none",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <div
              className="inline-block px-4 py-2 rounded mb-6 text-sm font-semibold"
              style={{
                background: "linear-gradient(180deg, var(--secondary) 0%, var(--muted) 100%)",
                border: "1px solid var(--border)",
                boxShadow: "inset 0 1px 0 rgba(255,255,240,0.5), 0 2px 4px rgba(0,0,0,0.1)",
                color: "var(--fg)",
              }}
            >
              Crafted with Purpose
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.1] mb-6"
              style={{ textShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
            >
              Feels Like
              <br />
              <span style={{
                color: "var(--primary)",
                textShadow: "0 1px 0 rgba(255,255,240,0.3)",
              }}>
                Real Life.
              </span>
            </h1>
            <p className="text-lg mb-8 max-w-xl leading-relaxed" style={{ color: "var(--muted-fg)" }}>
              Buttons you want to press. Textures you can almost touch. Skeuomorphism brings the physical world into the digital one with familiar, tactile interfaces.
            </p>
            <div className="flex gap-4">
              <button
                className="px-8 py-4 text-base font-bold rounded-lg"
                style={{
                  background: "linear-gradient(180deg, var(--primary) 0%, #6a340d 100%)",
                  color: "var(--primary-fg)",
                  border: "1px solid var(--primary)",
                  boxShadow: "0 3px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,240,0.3)",
                  borderRadius: "var(--radius-val)",
                }}
              >
                Press Me
              </button>
              <button
                className="px-8 py-4 text-base font-bold rounded-lg"
                style={{
                  background: "linear-gradient(180deg, var(--card) 0%, var(--muted) 100%)",
                  color: "var(--fg)",
                  border: "1px solid var(--border)",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,240,0.4)",
                  borderRadius: "var(--radius-val)",
                }}
              >
                Explore
              </button>
            </div>
          </div>

          {/* 3D-ish decorative panel */}
          <div className="flex-1">
            <div
              className="p-10 rounded-2xl relative"
              style={{
                background: "linear-gradient(145deg, var(--card) 0%, var(--muted) 100%)",
                border: "1px solid var(--border)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,240,0.3)",
                borderRadius: "var(--radius-val)",
              }}
            >
              <div className="grid grid-cols-2 gap-4">
                {["📁", "📊", "⚙️", "📅"].map((icon, i) => (
                  <div
                    key={i}
                    className="p-6 text-center rounded-xl"
                    style={{
                      background: "linear-gradient(180deg, var(--bg) 0%, var(--muted) 100%)",
                      border: "1px solid var(--border)",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,240,0.3)",
                    }}
                  >
                    <span className="text-3xl">{icon}</span>
                    <p className="text-xs mt-2 font-medium">Item {i + 1}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
