"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Background from "@/components/Background";
import SiteNav from "@/components/SiteNav";
import StyleRow from "@/components/StyleRow";
import StyleLoader from "@/components/StyleLoader";
import { STYLES, type StyleMeta } from "@/lib/styles";

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

      <SiteNav active="home" />

      <main className="wrap">
        <header className="hero">
          <p className="kicker">Seven systems · one mission</p>

          <h1>
            Pick a <span className="grad">design language</span>.
          </h1>
          <p className="sub">
            Hover a pill and it <strong>becomes the system it names</strong> —
            metal, blunt color, elevation, soft UI, frost, clay, or silence.
            Pick one and you enter Mission Control, built in that language.
            Not a theme toggle. Seven different products.
          </p>
          <ul className="hint">
            <li>hover to preview the physics</li>
            <li>pick one to launch</li>
            <li>Tab + Space works too</li>
          </ul>
        </header>

        <fieldset className="list" id="picker">
          <legend className="sr-only">Choose one design language</legend>

          {STYLES.map((style, i) => (
            <StyleRow key={style.slug} style={style} index={i} onPick={pick} />
          ))}
        </fieldset>

        <p className="footnote">
          Hand-rolled CSS · no UI libraries · personal edition by <b>Z</b>
        </p>
      </main>
    </>
  );
}
