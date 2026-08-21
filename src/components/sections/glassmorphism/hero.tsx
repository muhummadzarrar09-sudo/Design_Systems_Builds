"use client";

export function GlassmorphismHero() {
  return (
    <section
      className="py-24 px-8 relative overflow-hidden min-h-screen flex items-center"
      style={{
        background: "linear-gradient(135deg, #1a1b2f 0%, #2d1b69 50%, #1a1b2f 100%)",
      }}
    >
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, #6c63ff 0%, transparent 70%)",
            top: "-10%",
            right: "-5%",
            animation: "glass-float 20s ease-in-out infinite",
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, #ff6b6b 0%, transparent 70%)",
            bottom: "-5%",
            left: "-5%",
            animation: "glass-float 25s ease-in-out infinite reverse",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 w-full">
        <div className="max-w-3xl mx-auto text-center">
          {/* Glassmorphic badge */}
          <div
            className="inline-block px-6 py-3 rounded-full mb-8 text-sm font-medium backdrop-blur-xl"
            style={{
              backgroundColor: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.9)",
            }}
          >
            ✦ Experience Glassmorphism
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.1] mb-6"
            style={{ color: "rgba(255,255,255,0.95)" }}
          >
            See Through
            <br />
            <span style={{
              background: "linear-gradient(135deg, #6c63ff, #ff6b6b)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              The Noise.
            </span>
          </h1>

          <p className="text-lg mb-10 max-w-xl mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
            Frosted glass panels. Layered transparency. Backdrop blur that creates depth through elegance.
          </p>

          <div
            className="inline-flex gap-4 p-2 rounded-2xl backdrop-blur-xl mx-auto"
            style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <button
              className="px-8 py-4 text-base font-bold rounded-xl"
              style={{
                backgroundColor: "rgba(255,255,255,0.15)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)",
              }}
            >
              Get Started
            </button>
            <button
              className="px-8 py-4 text-base font-bold rounded-xl"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.8)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
              }}
            >
              Watch Demo
            </button>
          </div>
        </div>
      </div>

      {/* Glass cards at bottom */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-24 h-24 rounded-2xl backdrop-blur-xl"
            style={{
              backgroundColor: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          />
        ))}
      </div>
    </section>
  );
}
