"use client";

import { useEffect, useState } from "react";

/** Live UTC mission clock. */
export default function MissionClock() {
  const [now, setNow] = useState("--:--:--");

  useEffect(() => {
    const tick = () => setNow(new Date().toISOString().slice(11, 19));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return <span className="dash-clock">{now} UTC</span>;
}
