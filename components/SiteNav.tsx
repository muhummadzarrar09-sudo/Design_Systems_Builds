import Link from "next/link";

const LINKS = [
  { href: "/", id: "home", label: "Languages" },
  { href: "/states", id: "states", label: "Spec" },
  { href: "/lab", id: "lab", label: "Lab" },
  { href: "/inspo", id: "inspo", label: "Inspo" },
] as const;

export default function SiteNav({
  active = "home",
}: {
  active?: (typeof LINKS)[number]["id"];
}) {
  return (
    <nav className="site-nav" aria-label="Site">
      <Link href="/" className="site-nav__brand">
        Z<span>//DS</span>
      </Link>
      <ul className="site-nav__links">
        {LINKS.map((l) => (
          <li key={l.id}>
            <Link
              href={l.href}
              className={l.id === active ? "is-on" : undefined}
              aria-current={l.id === active ? "page" : undefined}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
