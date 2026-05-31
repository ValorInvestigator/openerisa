import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSponsor, getPlans, siblingsInState } from "@/lib/queries";
import { formatEin, titleCase, num, FORM_LABEL } from "@/lib/format";
import { stateName } from "@/lib/geo";
import { PREFIX_TO_SLUG, sectorForSlug } from "@/lib/naics";
import { SITE_URL } from "@/lib/site";
import SponsorList from "@/components/SponsorList";

export const revalidate = 86400; // ISR: regenerate at most daily
export const dynamicParams = true;
export async function generateStaticParams() {
  return []; // generate on first request, then cache
}

function normEin(raw: string): string | null {
  const d = (raw ?? "").replace(/\D/g, "");
  return d.length >= 7 && d.length <= 9 ? d.padStart(9, "0") : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ein: string }>;
}): Promise<Metadata> {
  const { ein: raw } = await params;
  const ein = normEin(raw);
  if (!ein) return { title: "Not found" };
  const s = await getSponsor(ein);
  if (!s) return { title: "Not found", robots: { index: false } };
  const name = titleCase(s.sponsor_name);
  const loc = [titleCase(s.city), s.state].filter(Boolean).join(", ");
  const title = `${name} — Form 5500 (EIN ${formatEin(s.ein)})`;
  const description =
    `ERISA Form 5500 benefit-plan filings for ${name}${loc ? ` of ${loc}` : ""} ` +
    `(EIN ${formatEin(s.ein)}): ${num(s.plan_count)} plan(s), filing years ${s.years ?? "—"}. ` +
    `Source: U.S. Department of Labor.`;
  return {
    title,
    description,
    alternates: { canonical: `/p/${s.ein}` },
    openGraph: { title, description, type: "profile" },
  };
}

export default async function ProviderPage({
  params,
}: {
  params: Promise<{ ein: string }>;
}) {
  const { ein: raw } = await params;
  const ein = normEin(raw);
  if (!ein) notFound();
  const sponsor = await getSponsor(ein);
  if (!sponsor) notFound();
  const plans = await getPlans(ein);

  const name = titleCase(sponsor.sponsor_name);
  const code = (sponsor.state ?? "").toUpperCase();
  const hasState = /^[A-Z]{2}$/.test(code);
  const stName = hasState ? stateName(code) : "";
  const loc = [titleCase(sponsor.city), sponsor.state, sponsor.zip].filter(Boolean).join(", ");
  const prefix = (sponsor.business_code ?? "").slice(0, 2);
  const industrySlug = PREFIX_TO_SLUG.get(prefix);
  const industryName = industrySlug ? sectorForSlug(industrySlug)?.name : undefined;
  const siblings = hasState ? await siblingsInState(code, sponsor.ein, 8) : [];

  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    ...(sponsor.dba_name ? { alternateName: titleCase(sponsor.dba_name) } : {}),
    identifier: { "@type": "PropertyValue", propertyID: "US-EIN", value: formatEin(sponsor.ein) },
    ...(hasState
      ? {
          address: {
            "@type": "PostalAddress",
            addressLocality: titleCase(sponsor.city) || undefined,
            addressRegion: code,
            postalCode: sponsor.zip || undefined,
            addressCountry: "US",
          },
        }
      : {}),
  };

  const crumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      ...(hasState
        ? [{ "@type": "ListItem", position: 2, name: stName, item: `${SITE_URL}/state/${code}` }]
        : []),
      {
        "@type": "ListItem",
        position: hasState ? 3 : 2,
        name,
        item: `${SITE_URL}/p/${sponsor.ein}`,
      },
    ],
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbLd) }} />

      <nav className="mb-5 text-sm text-muted">
        <Link href="/" className="text-brand hover:underline">Home</Link>
        {hasState ? (
          <>
            {" / "}
            <Link href={`/state/${code}`} className="text-brand hover:underline">{stName}</Link>
          </>
        ) : null}
        {" / "}
        <span>{name}</span>
      </nav>

      <header className="rounded-xl border border-line bg-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold leading-tight text-ink">{name}</h1>
            {sponsor.dba_name && titleCase(sponsor.dba_name) !== name ? (
              <p className="mt-0.5 text-sm text-muted">dba {titleCase(sponsor.dba_name)}</p>
            ) : null}
            {loc ? <p className="mt-1 text-sm text-muted">{loc}</p> : null}
          </div>
          <span className="rounded-lg bg-canvas px-3 py-1.5 font-mono text-sm font-semibold text-brand">
            EIN {formatEin(sponsor.ein)}
          </span>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Plans" value={num(sponsor.plan_count)} />
          <Stat label="Total participants" value={num(sponsor.total_participants)} />
          <Stat label="Filing years" value={sponsor.years?.split(",").join(", ") ?? "—"} />
          <Stat label="NAICS" value={sponsor.business_code ?? "—"} />
        </dl>

        {(hasState || industrySlug) && (
          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            {hasState && (
              <Link
                href={`/state/${code}`}
                className="rounded-full border border-line px-3 py-1 font-medium text-brand hover:border-brand"
              >
                Plan sponsors in {stName}
              </Link>
            )}
            {industrySlug && (
              <Link
                href={`/industry/${industrySlug}`}
                className="rounded-full border border-line px-3 py-1 font-medium text-brand hover:border-brand"
              >
                {industryName}
              </Link>
            )}
          </div>
        )}
      </header>

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink">
          Benefit plans on file
        </h2>
        <div className="overflow-hidden rounded-xl border border-line bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-2.5 font-medium">Year</th>
                <th className="px-4 py-2.5 font-medium">Form</th>
                <th className="px-4 py-2.5 font-medium">Plan #</th>
                <th className="px-4 py-2.5 font-medium">Plan name</th>
                <th className="px-4 py-2.5 text-right font-medium">Participants</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p, i) => (
                <tr key={`${p.year}-${p.plan_num}-${i}`} className="border-b border-line/70 last:border-0">
                  <td className="px-4 py-2.5 text-muted">{p.year}</td>
                  <td className="px-4 py-2.5">
                    <span className="rounded bg-canvas px-1.5 py-0.5 font-mono text-xs text-muted">
                      {FORM_LABEL[p.form_type] ?? p.form_type}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted">{p.plan_num ?? "—"}</td>
                  <td className="px-4 py-2.5 text-ink">{titleCase(p.plan_name) || "—"}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-ink">{num(p.participants)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-relaxed text-muted">
        Data shown as filed with the U.S. Department of Labor (EBSA), filing years 2020–2025; not
        validated by OpenERISA. View official filings for this EIN on the{" "}
        <a
          className="font-medium text-brand underline"
          href="https://www.efast.dol.gov/5500search/"
          target="_blank"
          rel="noopener noreferrer"
        >
          DOL EFAST2 search
        </a>
        .
      </p>

      {siblings.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink">
            Other plan sponsors in {stName}
          </h2>
          <SponsorList rows={siblings} />
          <p className="mt-4 text-sm">
            <Link href={`/state/${code}`} className="font-medium text-brand hover:underline">
              All {stName} plan sponsors →
            </Link>
          </p>
        </section>
      )}
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 font-semibold text-ink">{value}</dd>
    </div>
  );
}
