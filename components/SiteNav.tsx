"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Cockpit" },
  { href: "/inspo", label: "Inspo" },
  { href: "/lab", label: "Lab" },
  { href: "/dash/skeuomorphism", label: "Skeuo" },
  { href: "/dash/glassmorphism", label: "Glass" },
  { href: "/dash/neumorphism", label: "Neumo" },
];

export default function SiteNav() {
  const pathname = usePathname();
  return (
    <nav className="site-nav">
      <div className="site-nav-inner">
        <div className="site-brand">
          <span className="brand-bolt" />
          <span className="brand-text">SKEUO·LAB</span>
        </div>
        <div className="site-links">
          {links.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href} className={`nav-link ${active ? "active" : ""}`}>
                <span className="nav-link-text">{l.label}</span>
                <span className="nav-link-screw l" />
                <span className="nav-link-screw r" />
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
