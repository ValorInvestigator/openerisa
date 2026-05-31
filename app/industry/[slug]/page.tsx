import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { countBySector, sponsorsBySector } from "@/lib/queries";
import { sectorForSlug } from "@/lib/naics";
import { num } from "@/lib/format";
import { PAGE_SIZE, DATA_YEARS } from "@/lib/site";
import SponsorList from "@/components/SponsorList";
import Pager from "@/components/Pager";

export const revalidate = 86400;
export const dynamicParams = true;
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sector = sectorForSlug(slug);
  if (!sector) return { title: "Not found", robots: { index: false } };
  return {
    title: `${sector.name} — Form 5500 Plan Sponsors`,
    description: `Employer benefit-plan (Form 5500) sponsors in the ${sector.name} sector, ${DATA_YEARS}.`,
    alternates: { canonical: `/industry/${slug}` },
  };
}

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sector = sectorForSlug(slug);
  if (!sector) notFound();
  const total = await countBySector(sector.prefixes);
  if (!total) notFound();
  const rows = await sponsorsBySector(sector.prefixes, 1, PAGE_SIZE);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <nav className="mb-4 text-sm text-muted">
        <Link href="/" className="text-brand hover:underline">Home</Link> /{" "}
        <Link href="/industries" className="text-brand hover:underline">Industries</Link> / {sector.name}
      </nav>
      <h1 className="text-3xl font-bold text-brand">{sector.name}</h1>
      <p className="mt-2 text-muted">
        {num(total)} plan sponsor{total === 1 ? "" : "s"} in the {sector.name} sector filed an ERISA
        Form 5500 ({DATA_YEARS}).
      </p>
      <div className="mt-8">
        <SponsorList rows={rows} />
      </div>
      <Pager basePath={`/industry/${slug}`} page={1} totalPages={totalPages} />
    </div>
  );
}
