import type { Metadata } from "next";
import Link from "next/link";
import LabDemo from "@/components/LabDemo";

export const metadata: Metadata = {
  title: "State lab — Design Systems Builds",
  description:
    "See all seven design systems render each interaction state, side by side.",
};

export default function LabPage() {
  return (
    <main className="wrap">
      <header className="hero">
        <div className="hero__row">
          <span className="mark" aria-hidden="true">
            Z
          </span>
          <p className="kicker">State lab</p>
        </div>
        <h1>
          Every state, <span className="grad">seven ways</span>.
        </h1>
        <p className="sub">
          Pick a state and watch all seven design systems render it at once —
          the same button, the same card, seven different rules of physics.
        </p>
        <Link className="back-link" href="/">
          ← back to the picker
        </Link>
      </header>

      <LabDemo />
    </main>
  );
}
