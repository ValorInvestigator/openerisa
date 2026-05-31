import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
  params: Promise<{ st: string }>;
}): Promise<Metadata> {
  const { st } = await params;
  const code = st.toUpperCase();
  const name = stateName(code);
  return {
    title: `${name} — Form 5500 Plan Sponsors`,
    description: `Employer benefit-plan (Form 5500) sponsors in ${name}, ${DATA_YEARS}. Search ERISA filings by company name or EIN.`,
    alternates: { canonical: `/state/${code}` },
  };
}

export default async function StatePage({ params }: { params: Promise<{ st: string }> }) {
  const { st } = await params;
  const code = st.toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) notFound();
  const total = await countByState(code);
  if (!total) notFound();
  const rows = await sponsorsByState(code, 1, PAGE_SIZE);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const name = stateName(code);

  return (
    <div>
      <nav className="mb-4 text-sm text-muted">
        <Link href="/" className="text-brand hover:underline">Home</Link> /{" "}
        <Link href="/states" className="text-brand hover:underline">States</Link> / {name}
      </nav>
      <h1 className="text-3xl font-bold text-brand">Form 5500 Plan Sponsors in {name}</h1>
      <p className="mt-2 text-muted">
        {num(total)} plan sponsor{total === 1 ? "" : "s"} in {name} filed an ERISA Form 5500
        ({DATA_YEARS}).
      </p>
      <div className="mt-8">
        <SponsorList rows={rows} />
      </div>
      <Pager basePath={`/state/${code}`} page={1} totalPages={totalPages} />
    </div>
  );
}
