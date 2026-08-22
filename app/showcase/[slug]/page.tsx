import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { STYLES } from "@/lib/styles";
import ShowcaseSlide from "@/components/ShowcaseSlide";

export const dynamicParams = false;

export function generateStaticParams() {
  return STYLES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const style = STYLES.find((s) => s.slug === slug);
  if (!style) return { title: "Not found" };
  return {
    title: `${style.name} · slide — Design Systems Builds`,
    description: `Instagram-ready carousel slide (1080×1350) of the Mission Control dashboard in ${style.name}.`,
  };
}

export default async function ShowcasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const style = STYLES.find((s) => s.slug === slug);
  if (!style) notFound();

  const index = STYLES.findIndex((s) => s.slug === slug);

  return (
    <main className="showcase-page">
      <div className="showcase-toolbar">
        <Link href="/" className="showcase-toolbar-back">
          ← picker
        </Link>
        <span className="showcase-toolbar-meta">
          1080 × 1350 px · screenshot at 100% zoom
        </span>
        <div className="showcase-switch" aria-label="Other styles">
          {STYLES.map((s) => (
            <Link
              key={s.slug}
              href={`/showcase/${s.slug}`}
              className={s.slug === style.slug ? "active" : ""}
            >
              {String(STYLES.findIndex((x) => x.slug === s.slug) + 1).padStart(2, "0")}
            </Link>
          ))}
        </div>
      </div>

      <div className="showcase-stage">
        <ShowcaseSlide style={style} index={index} />
      </div>

      <p className="showcase-tip">
        The slide is exactly 1080×1350 px — open it, screenshot the canvas at 100%
        zoom, and it's ready for your carousel. <Link href="/showcase">all slides</Link>
      </p>
    </main>
  );
}
