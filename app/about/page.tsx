import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "OpenERISA is a free, no-login search of U.S. Department of Labor Form 5500 filings, " +
    "a public-interest project by Valor Investigations.",
};

export default function About() {
  return (
    <article className="mx-auto max-w-2xl text-sm leading-relaxed text-muted">
      <h1 className="text-2xl font-bold text-ink">About OpenERISA</h1>

      <p className="mt-4">
        OpenERISA is a free, no-login search of U.S. Department of Labor{" "}
        <strong className="text-ink">Form 5500</strong> filings — the annual reports that most
        employer-sponsored benefit plans (401(k)s, pensions, and health &amp; welfare plans) are
        required to file under ERISA.
      </p>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-ink">What you can find</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>Search any employer by company name or 9-digit EIN.</li>
        <li>See every plan a sponsor filed, with participant counts and filing years.</li>
        <li>Filter by state, form type (5500 / 5500-SF), and year.</li>
      </ul>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-ink">Where the data comes from</h2>
      <p className="mt-2">
        All data is sourced from the public Form 5500 datasets published by the U.S. Department of
        Labor, Employee Benefits Security Administration (EBSA), for filing years 2024–2025. It is
        presented exactly as filed and is not validated or endorsed by OpenERISA. For certified or
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
        OpenERISA is a public-interest project by{" "}
        <a
          className="font-medium text-brand underline"
          href="https://www.valor-investigations.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Valor Investigations
        </a>
        , built to make benefit-plan transparency genuinely accessible.
      </p>

      <Link href="/" className="mt-10 inline-block text-sm font-medium text-brand hover:underline">
        ← Back to search
      </Link>
    </article>
  );
}
