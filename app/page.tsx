"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Background from "@/components/Background";
import StyleRow from "@/components/StyleRow";
import StyleLoader from "@/components/StyleLoader";
import { STYLES, type StyleMeta } from "@/lib/styles";

/**
 * The picker. One choice → that style's loader → its Mission Control.
 * Hover still previews the look; multi-select is gone (radios, not
 * checkboxes), so the summary bar is gone with it.
 */
export default function Home() {
  const router = useRouter();
  const [launching, setLaunching] = useState<StyleMeta | null>(null);

  const pick = useCallback((style: StyleMeta) => {
    setLaunching(style);
  }, []);

  const enterDashboard = useCallback(() => {
    if (launching) router.push(`/dash/${launching.slug}`);
  }, [launching, router]);

  return (
    <>
      <Background />

      {launching && (
        <StyleLoader
          key={launching.slug}
          slug={launching.slug}
          onDone={enterDashboard}
        />
      )}

      <main className="wrap">
        <header className="hero">
          <div className="hero__row">
            <span className="mark" aria-hidden="true">
              Z
            </span>
            <p className="kicker">Design Systems Builds · personal edition</p>
          </div>

          <h1>
            Pick a <span className="grad">design language</span>.
          </h1>
          <p className="sub">
            Seven design systems, one Mission Control dashboard.{" "}
            <strong>Pick one</strong> and its loader hands you off to the
            dashboard coded in that system — brushed metal, blunt flat,
            ripples, frost, squish or silence. Built with{" "}
            <strong>Next.js</strong> on Node, styled with hand-rolled CSS on a
            pure <strong>#000000</strong> canvas.
          </p>
          <ul className="hint">
            <li>pick one to launch its dashboard</li>
            <li>hover to preview the look</li>
            <li>Tab + Space works too</li>
            <li>
              <a href="/inspo">inspo board →</a>
            </li>
            <li>
              <a href="/states">states spec →</a>
            </li>
            <li>
              <a href="/lab">state lab →</a>
            </li>
          </ul>
        </header>

        <fieldset className="list" id="picker">
          <legend className="sr-only">Choose one design language</legend>

          {STYLES.map((style, i) => (
            <StyleRow key={style.slug} style={style} index={i} onPick={pick} />
          ))}
        </fieldset>
      </main>
    </>
  );
}
