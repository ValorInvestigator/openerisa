import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, CONTACT_EMAIL, DATA_YEARS, DATA_LASTMOD } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `Terms of use and data disclaimer for ${SITE_NAME}.`,
  alternates: { canonical: "/terms" },
};

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-ink">{children}</h2>;
}

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-2xl text-sm leading-relaxed text-muted">
      <h1 className="text-2xl font-bold text-brand">Terms of Use</h1>
      <p className="mt-1 text-xs">Last updated: {DATA_LASTMOD}</p>

      <p className="mt-5">
        {SITE_NAME} is a free service operated by Valor Investigations that lets you search public
        U.S. Department of Labor Form 5500 filings. By using it, you agree to these terms.
      </p>

      <H>The data, and its accuracy</H>
      <p className="mt-2">
        All information shown comes from the public Form 5500 datasets published by the U.S.
        Department of Labor, Employee Benefits Security Administration (EBSA), filing years{" "}
        {DATA_YEARS}. It is presented <strong className="text-ink">exactly as filed</strong> by plan
        sponsors. Filings can contain errors, omissions, or outdated information, and {SITE_NAME}{" "}
        does not independently verify or validate them. For official or certified records, always
        use the DOL&rsquo;s{" "}
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

      <H>Not professional advice</H>
      <p className="mt-2">
        {SITE_NAME} is an informational research tool. Nothing on it is legal, financial, tax,
        investment, or other professional advice, and it should not be relied on as such.
      </p>

      <H>Provided &ldquo;as is&rdquo;</H>
      <p className="mt-2">
        The service is provided &ldquo;as is&rdquo; and &ldquo;as available,&rdquo; without
        warranties of any kind, express or implied, including accuracy, completeness, fitness for a
        particular purpose, or uninterrupted availability.
      </p>

      <H>Limitation of liability</H>
      <p className="mt-2">
        To the fullest extent permitted by law, Valor Investigations is not liable for any damages
        arising from your use of, or reliance on, {SITE_NAME} or its data.
      </p>

      <H>Acceptable use</H>
      <p className="mt-2">
        Please use {SITE_NAME} lawfully and don&rsquo;t attempt to disrupt, overload, or abuse the
        service, or use it to harass others. The underlying data is public record.
      </p>

      <H>Corrections</H>
      <p className="mt-2">
        Because the data mirrors public government filings, corrections to a filing must be made
        through the filer and the DOL &mdash; {SITE_NAME} can&rsquo;t alter the source records. If
        you spot a display issue on the site, let us know.
      </p>

      <H>Changes</H>
      <p className="mt-2">
        We may update these terms as the service evolves; continued use means you accept the current
        version.
      </p>

      <H>Contact</H>
      <p className="mt-2">
        Email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-brand underline">{CONTACT_EMAIL}</a>.
      </p>

      <Link href="/" className="mt-10 inline-block text-sm font-medium text-brand hover:underline">
        &larr; Back to search
      </Link>
    </article>
  );
}
