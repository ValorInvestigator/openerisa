import Link from "next/link";
import SearchBox from "./search-box";
import { search } from "@/lib/queries";
import { formatEin, titleCase, num } from "@/lib/format";

export const dynamic = "force-dynamic"; // results depend on query string

type SP = { [k: string]: string | string[] | undefined };
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function Home({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = one(sp.q);
  const state = one(sp.state);
  const form = one(sp.form);
  const year = one(sp.year);

  const hasQuery = q.trim().length > 0;
  const { rows } = hasQuery ? await search({ q, state, form, year }) : { rows: [] };

  return (
    <div>
      {!hasQuery && (
        <section className="pb-2 pt-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-brand sm:text-5xl">
            Search every U.S. benefit plan filing
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
            Look up any employer&rsquo;s ERISA Form 5500 — by company name or EIN. Sponsors, plans,
            participant counts, and locations from the Department of Labor. Free, no login.
          </p>
        </section>
      )}

      <div className={hasQuery ? "pt-2" : "mx-auto mt-10 max-w-3xl"}>
        <SearchBox initialQ={q} initialState={state} initialForm={form} initialYear={year} autoFocus={!hasQuery} />
      </div>

      {hasQuery ? (
        <section className="mt-6">
          <p className="mb-3 text-sm text-muted">
            {rows.length === 0
              ? "No matching plan sponsors found."
              : `${rows.length}${rows.length === 40 ? "+" : ""} sponsor${rows.length === 1 ? "" : "s"}`}
            {state || form || year ? " (filtered)" : ""}
          </p>

          {rows.length === 0 ? (
            <div className="rounded-xl border border-line bg-surface p-8 text-center text-sm text-muted">
              Try a shorter or differently spelled company name, drop the filters, or paste the
              9-digit EIN.
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {rows.map((r) => (
                <li key={r.ein}>
                  <Link
                    href={`/p/${r.ein}`}
                    className="block rounded-xl border border-line bg-surface p-4 transition hover:border-brand hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-lg font-semibold leading-snug text-ink">{titleCase(r.sponsor_name)}</h2>
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
          )}
        </section>
      ) : (
        <section className="mx-auto mt-12 max-w-2xl text-sm leading-relaxed text-muted">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink">What is a Form 5500?</h2>
          <p className="mt-2">
            Most U.S. employer-sponsored benefit plans — 401(k)s, pensions, and health &amp; welfare
            plans — must file a Form 5500 with the Department of Labor each year. The filing names
            the plan sponsor (employer), its EIN, the plan, the number of participants, and the
            sponsor&rsquo;s location. OpenERISA makes those public filings searchable in one place.
          </p>
        </section>
      )}

      {!hasQuery && (
        <section className="mx-auto mt-8 max-w-2xl text-center text-sm">
          <p className="text-muted">
            Or browse{" "}
            <Link href="/states" className="font-medium text-brand hover:underline">by state</Link>{" "}
            or{" "}
            <Link href="/industries" className="font-medium text-brand hover:underline">by industry</Link>.
          </p>
        </section>
      )}
    </div>
  );
}
