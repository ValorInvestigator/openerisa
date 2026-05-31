import type { Metadata } from "next";
import Link from "next/link";
import { sectorCounts } from "@/lib/queries";
import { SECTORS } from "@/lib/naics";
import { num } from "@/lib/format";
import { DATA_YEARS } from "@/lib/site";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Form 5500 Filings by Industry",
  description: `Browse U.S. employer benefit-plan (Form 5500) filings by industry (NAICS sector), ${DATA_YEARS}.`,
  alternates: { canonical: "/industries" },
};

export default async function IndustriesPage() {
  const counts = await sectorCounts();
  const rows = SECTORS.map((s) => ({
    slug: s.slug,
    name: s.name,
    count: s.prefixes.reduce((n, p) => n + (counts[p] ?? 0), 0),
  }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <div>
      <nav className="mb-4 text-sm text-muted">
        <Link href="/" className="text-brand hover:underline">Home</Link> / Industries
      </nav>
      <h1 className="text-3xl font-bold text-brand">Form 5500 Filings by Industry</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Plan sponsors that filed an ERISA Form 5500 ({DATA_YEARS}), grouped by NAICS industry sector.
      </p>
      <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {rows.map((r) => (
          <li key={r.slug}>
            <Link
              href={`/industry/${r.slug}`}
              className="flex items-center justify-between rounded-xl border border-line bg-surface px-4 py-3 hover:border-brand"
            >
              <span className="font-medium text-ink">{r.name}</span>
              <span className="text-xs text-muted">{num(r.count)}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-10 text-sm">
        <Link href="/states" className="font-medium text-brand hover:underline">Browse by state →</Link>
      </p>
    </div>
  );
}
