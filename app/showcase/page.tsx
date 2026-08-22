import type { Metadata } from "next";
import Link from "next/link";
import { STYLES } from "@/lib/styles";

export const metadata: Metadata = {
  title: "Carousel slides — Design Systems Builds",
  description:
    "Instagram-ready 1080×1350 slides: the Mission Control dashboard in all seven design systems.",
};

export default function ShowcaseIndex() {
  return (
    <main className="wrap">
      <header className="hero">
        <div className="hero__row">
          <span className="mark" aria-hidden="true">
            Z
          </span>
          <p className="kicker">Carousel slides</p>
        </div>
        <h1>
          Seven styles, <span className="grad">seven slides</span>.
        </h1>
        <p className="sub">
          Every slide is the Mission Control dashboard at <strong>1080 × 1350</strong>{" "}
          (4:5), coded in that design system. Open a slide, screenshot it at 100%
          zoom, and it's Instagram-ready.
        </p>
      </header>

      <section className="showcase-index">
        {STYLES.map((s, i) => (
          <Link key={s.slug} href={`/showcase/${s.slug}`} className="showcase-tile">
            <span className="showcase-tile-num">{String(i + 1).padStart(2, "0")}</span>
            <span className="showcase-tile-name">{s.name}</span>
            <span className="showcase-tile-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        ))}
      </section>

      <p className="footnote">
        Open a slide → screenshot at 100% zoom → post to your carousel
      </p>
    </main>
  );
}
