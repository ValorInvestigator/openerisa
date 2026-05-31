import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, CONTACT_EMAIL, DATA_YEARS } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    `${SITE_NAME} is a free, no-login search of U.S. Department of Labor Form 5500 filings, ` +
    `a public-interest project by Valor Investigations.`,
  alternates: { canonical: "/about" },
};

export default function About() {
  return (
    <article className="mx-auto max-w-2xl text-sm leading-relaxed text-muted">
      <h1 className="text-2xl font-bold text-brand">About {SITE_NAME}</h1>

      <p className="mt-4">
        {SITE_NAME} is a free, no-login search of U.S. Department of Labor{" "}
        <strong className="text-ink">Form 5500</strong> filings &mdash; the annual reports that most
        employer-sponsored benefit plans (401(k)s, pensions, and health &amp; welfare plans) are
        required to file under ERISA.
      </p>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-ink">What you can find</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>Search any employer by company name or 9-digit EIN.</li>
        <li>See every plan a sponsor filed, with participant counts and filing years.</li>
        <li>Browse by state or industry, and filter by form type and year.</li>
      </ul>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-ink">Where the data comes from</h2>
      <p className="mt-2">
        All data is sourced from the public Form 5500 datasets published by the U.S. Department of
        Labor, Employee Benefits Security Administration (EBSA), filing years {DATA_YEARS}. It is
        presented exactly as filed and is not validated or endorsed by {SITE_NAME}. For certified or
        complete records, use the DOL&rsquo;s official{" "}
        <a
          className="font-medium text-brand underline"
          href="https://www.efast.dol.gov/5500search/"
          target="_blank"
          rel="noopener noreferrer"
        >
          EFAST2 filing search
        </a>
        .
      </p>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-ink">Who built it</h2>
      <p className="mt-2">
        {SITE_NAME} was built by{" "}
        <a
          className="font-medium text-brand underline"
          href="https://www.valor-investigations.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Valor Investigations
        </a>{" "}
        &mdash; independent investigative research and reporting, with a habit of turning buried
        public records into tools people can actually use. If you or your organization needs that
        kind of work &mdash; public-records research, data wrangling, or a custom tool like this one
        &mdash; you can reach us at{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-brand underline">{CONTACT_EMAIL}</a>.
      </p>

      <p className="mt-8 text-xs">
        <Link href="/privacy" className="text-brand hover:underline">Privacy Policy</Link>
        {" · "}
        <Link href="/terms" className="text-brand hover:underline">Terms of Use</Link>
      </p>

      <Link href="/" className="mt-8 inline-block text-sm font-medium text-brand hover:underline">
        &larr; Back to search
      </Link>
    </article>
  );
}
