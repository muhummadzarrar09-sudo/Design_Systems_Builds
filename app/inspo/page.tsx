import type { Metadata } from "next";
import Image from "next/image";
import { INSPOS } from "@/lib/inspo";
import SiteNav from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "Inspiration board — Design Systems Builds",
  description:
    "One brief, seven design languages: the Mission Control dashboard re-skinned in every style. AI concept art we build from.",
};

export default function InspoPage() {
  return (
    <>
    <SiteNav active="inspo" />
    <main className="wrap">
      <header className="hero">
        <p className="kicker">Inspiration board</p>

        <h1>
          One brief, <span className="grad">seven styles</span>.
        </h1>
        <p className="sub">
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
        {INSPOS.map((item) => (
          <article className="inspo-card" key={item.slug}>
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

      <p className="footnote">
        AI-generated concept art · topic: <b>Mission Control</b> · the visual
        language for the real builds
      </p>
    </main>
    </>
  );
}
