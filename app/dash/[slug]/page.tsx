import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { STYLES } from "@/lib/styles";
import MissionDashboard from "@/components/MissionDashboard";

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
    title: `${style.name} · Mission Control — Design Systems Builds`,
    description: `The Aurora-9 Mission Control dashboard, coded in ${style.name}.`,
  };
}

export default async function DashPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const style = STYLES.find((s) => s.slug === slug);
  if (!style) notFound();
  return <MissionDashboard style={style} />;
}
