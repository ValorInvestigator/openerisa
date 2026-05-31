import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { countByState, sponsorsByState } from "@/lib/queries";
import { stateName } from "@/lib/geo";
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
  params: Promise<{ st: string; page: string }>;
}): Promise<Metadata> {
  const { st, page } = await params;
  const code = st.toUpperCase();
  const name = stateName(code);
  return {
    title: `${name} — Form 5500 Plan Sponsors (page ${page})`,
    description: `Employer benefit-plan (Form 5500) sponsors in ${name}, ${DATA_YEARS} — page ${page}.`,
    alternates: { canonical: `/state/${code}/${page}` },
    robots: { index: false, follow: true }, // deep listing pages: crawl, don't index
  };
}

export default async function StatePagePaged({
  params,
}: {
  params: Promise<{ st: string; page: string }>;
}) {
  const { st, page: pageStr } = await params;
  const code = st.toUpperCase();
  const page = Number(pageStr);
  if (!/^[A-Z]{2}$/.test(code) || !Number.isInteger(page) || page < 1) notFound();
  if (page === 1) redirect(`/state/${code}`);

  const total = await countByState(code);
  if (!total) notFound();
  const totalPages = Math.ceil(total / PAGE_SIZE);
  if (page > totalPages) notFound();
  const rows = await sponsorsByState(code, page, PAGE_SIZE);
  const name = stateName(code);

  return (
    <div>
      <nav className="mb-4 text-sm text-muted">
        <Link href="/" className="text-brand hover:underline">Home</Link> /{" "}
        <Link href="/states" className="text-brand hover:underline">States</Link> /{" "}
        <Link href={`/state/${code}`} className="text-brand hover:underline">{name}</Link> / Page {page}
      </nav>
      <h1 className="text-3xl font-bold text-brand">Form 5500 Plan Sponsors in {name}</h1>
      <p className="mt-2 text-muted">
        Page {page} of {num(totalPages)} · {num(total)} sponsors ({DATA_YEARS}).
      </p>
      <div className="mt-8">
        <SponsorList rows={rows} />
      </div>
      <Pager basePath={`/state/${code}`} page={page} totalPages={totalPages} />
    </div>
  );
}
