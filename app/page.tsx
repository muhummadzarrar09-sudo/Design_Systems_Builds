"use client";

import { useRouter } from "next/navigation";
import Background from "@/components/Background";
import StyleRow from "@/components/StyleRow";
import SummaryBar from "@/components/SummaryBar";
import { useStyleSelection } from "@/hooks/useStyleSelection";
import { STYLES } from "@/lib/styles";

export default function Home() {
  const router = useRouter();
  const { selected, ready, toggle, setAll, clear } = useStyleSelection();

  const handleSelectAll = () =>
    setAll(selected.length === STYLES.length ? [] : STYLES.map((s) => s.name));

  const openDashboard = (slug: string) => router.push(`/dash/${slug}`);

  return (
    <>
      <Background />

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
            <strong>Click a style</strong> and you enter the dashboard coded in
            that system — brushed metal, blunt flat, ripples, frost, squish or
            silence. Built with <strong>Next.js</strong> on Node, styled with
            hand-rolled CSS on a pure <strong>#000000</strong> canvas.
          </p>
          <ul className="hint">
            <li>click a style to enter its dashboard</li>
            <li>hover to preview the look</li>
            <li>Tab + Space works too</li>
            <li>
              <a href="/inspo">inspo board →</a>
            </li>
          </ul>
        </header>

        <fieldset className="list" id="picker">
          <legend className="sr-only">Choose your design languages</legend>

          {STYLES.map((style, i) => (
            <StyleRow
              key={style.slug}
              style={style}
              index={i}
              checked={selected.includes(style.name)}
              onToggle={toggle}
              onNavigate={openDashboard}
            />
          ))}
        </fieldset>

        {ready && (
          <SummaryBar
            selected={selected}
            total={STYLES.length}
            onRemove={toggle}
            onSelectAll={handleSelectAll}
            onClear={clear}
          />
        )}

        <p className="footnote">
          Next.js App Router · Node · CSS variables · <code>:has()</code> ·{" "}
          <code>backdrop-filter</code> · keyframes · no images · background{" "}
          <b>#000000</b> · hand-built by <b>Z</b> · Rawalpindi, PK
        </p>
      </main>
    </>
  );
}
