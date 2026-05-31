import Link from "next/link";
import type { SponsorRow } from "@/lib/queries";
import { formatEin, titleCase, num } from "@/lib/format";

export default function SponsorList({ rows }: { rows: SponsorRow[] }) {
  if (!rows.length) {
    return <p className="text-sm text-muted">No sponsors found.</p>;
  }
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {rows.map((r) => (
        <li key={r.ein}>
          <Link
            href={`/p/${r.ein}`}
            className="block rounded-xl border border-line bg-surface p-4 transition hover:border-brand hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-semibold leading-snug text-ink">{titleCase(r.sponsor_name)}</h3>
              <span className="shrink-0 rounded-md bg-canvas px-2 py-0.5 font-mono text-xs text-muted">
                {formatEin(r.ein)}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
              {r.city || r.state ? (
                <span>{[titleCase(r.city), r.state].filter(Boolean).join(", ")}</span>
              ) : null}
              <span>·</span>
              <span>{num(r.plan_count)} plan{r.plan_count === 1 ? "" : "s"}</span>
              {r.years ? (
                <>
                  <span>·</span>
                  <span>{r.years.split(",").join(", ")}</span>
                </>
              ) : null}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
