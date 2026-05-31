import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
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
  params: Promise<{ slug: string; page: string }>;
}): Promise<Metadata> {
  const { slug, page } = await params;
  const sector = sectorForSlug(slug);
  if (!sector) return { title: "Not found", robots: { index: false } };
  return {
    title: `${sector.name} — Form 5500 Plan Sponsors (page ${page})`,
    description: `${sector.name} sector ERISA Form 5500 sponsors, ${DATA_YEARS} — page ${page}.`,
    alternates: { canonical: `/industry/${slug}/${page}` },
    robots: { index: false, follow: true },
  };
}

export default async function IndustryPagePaged({
  params,
}: {
  params: Promise<{ slug: string; page: string }>;
}) {
  const { slug, page: pageStr } = await params;
  const sector = sectorForSlug(slug);
  if (!sector) notFound();
  const page = Number(pageStr);
  if (!Number.isInteger(page) || page < 1) notFound();
  if (page === 1) redirect(`/industry/${slug}`);

  const total = await countBySector(sector.prefixes);
  if (!total) notFound();
  const totalPages = Math.ceil(total / PAGE_SIZE);
  if (page > totalPages) notFound();
  const rows = await sponsorsBySector(sector.prefixes, page, PAGE_SIZE);

  return (
    <div>
      <nav className="mb-4 text-sm text-muted">
        <Link href="/" className="text-brand hover:underline">Home</Link> /{" "}
        <Link href="/industries" className="text-brand hover:underline">Industries</Link> /{" "}
        <Link href={`/industry/${slug}`} className="text-brand hover:underline">{sector.name}</Link> / Page {page}
      </nav>
      <h1 className="text-3xl font-bold text-brand">{sector.name}</h1>
      <p className="mt-2 text-muted">
        Page {page} of {num(totalPages)} · {num(total)} sponsors ({DATA_YEARS}).
      </p>
      <div className="mt-8">
        <SponsorList rows={rows} />
      </div>
      <Pager basePath={`/industry/${slug}`} page={page} totalPages={totalPages} />
    </div>
  );
}
