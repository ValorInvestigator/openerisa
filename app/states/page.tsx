import type { Metadata } from "next";
import Link from "next/link";
import { listStates } from "@/lib/queries";
import { stateName } from "@/lib/geo";
import { num } from "@/lib/format";
import { DATA_YEARS } from "@/lib/site";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Form 5500 Filings by State",
  description: `Browse U.S. employer benefit-plan (Form 5500) filings by state, ${DATA_YEARS}. Find ERISA plan sponsors in every state.`,
  alternates: { canonical: "/states" },
};

export default async function StatesPage() {
  const states = await listStates();
  return (
    <div>
      <nav className="mb-4 text-sm text-muted">
        <Link href="/" className="text-brand hover:underline">Home</Link> / States
      </nav>
      <h1 className="text-3xl font-bold text-brand">Form 5500 Filings by State</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Plan sponsors that filed an ERISA Form 5500 ({DATA_YEARS}), grouped by the sponsor&rsquo;s
        state. Choose a state to browse its employer benefit plans.
      </p>
      <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {states.map((s) => (
          <li key={s.state}>
            <Link
              href={`/state/${s.state}`}
              className="flex items-center justify-between rounded-xl border border-line bg-surface px-4 py-3 hover:border-brand"
            >
              <span className="font-medium text-ink">{stateName(s.state)}</span>
              <span className="text-xs text-muted">{num(s.count)}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-10 text-sm">
        <Link href="/industries" className="font-medium text-brand hover:underline">
          Browse by industry →
        </Link>
      </p>
    </div>
  );
}
