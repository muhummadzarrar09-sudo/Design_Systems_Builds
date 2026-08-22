import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { INSPOS } from "@/lib/inspo";

export const metadata: Metadata = {
  title: "Inspiration board — Design Systems Builds",
  description:
    "One brief, seven design languages: the Mission Control dashboard re-skinned in every style. AI concept art we build from.",
};

export default function InspoPage() {
  return (
    <main className="wrap">
      <header className="hero">
        <div className="hero__row" data-reveal="fade">
          <span className="mark" aria-hidden="true">
            Z
          </span>
          <p className="kicker">Inspiration board</p>
        </div>

        <h1 data-reveal="up" style={{ "--rd": "80ms" } as CSSProperties}>
          One brief, <span className="grad">seven styles</span>.
        </h1>
        <p
          className="sub"
          data-reveal="up"
          style={{ "--rd": "160ms" } as CSSProperties}
        >
          Every frame is the same brief — a space <strong>Mission Control</strong>{" "}
          dashboard — re-skinned in each design language. These are our
          reference cards for building the real dashboards, portfolios and
          sites.
        </p>
        <a className="back-link" href="/">
          ← back to the picker
        </a>
      </header>

      <section className="inspo-list">
        {INSPOS.map((item, i) => (
          <article
            className="inspo-card"
            key={item.slug}
            data-reveal="up"
            style={{ "--rd": `${(i % 2) * 90}ms` } as CSSProperties}
          >
            <figure className="inspo-figure">
              <Image
                src={`/inspo/${item.slug}.png`}
                alt={`${item.name} — Mission Control dashboard concept`}
                fill
                sizes="(max-width: 900px) 100vw, 50vw"
                className="inspo-img"
              />
            </figure>
            <div className="inspo-body">
              <h2>
                <span className="inspo-num">{item.num}</span>
                {item.name}
              </h2>
              <p className="inspo-steal">{item.steal}</p>
            </div>
          </article>
        ))}
      </section>

      <p className="footnote" data-reveal="fade">
        AI-generated concept art · topic: <b>Mission Control</b> · the visual
        language for the real builds
      </p>
    </main>
  );
}
