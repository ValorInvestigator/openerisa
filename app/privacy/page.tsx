import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, CONTACT_EMAIL, DATA_LASTMOD } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE_NAME} handles data and privacy.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl text-sm leading-relaxed text-muted">
      <h1 className="text-2xl font-bold text-brand">Privacy Policy</h1>
      <p className="mt-1 text-xs">Last updated: {DATA_LASTMOD}</p>

      <p className="mt-5">
        {SITE_NAME} is a free public tool operated by Valor Investigations. It&rsquo;s built to be
        used without an account, and we collect as little as possible.
      </p>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-ink">What we collect</h2>
      <ul className="mt-2 list-disc space-y-2 pl-5">
        <li>
          <strong className="text-ink">Nothing from you to search.</strong> No account, login, or
          personal information is required to use {SITE_NAME}.
        </li>
        <li>
          <strong className="text-ink">Standard server logs.</strong> Like any website, our host
          records routine technical request data (such as IP address and browser type) for security
          and reliable operation. We don&rsquo;t use it to build profiles of individuals.
        </li>
        <li>
          <strong className="text-ink">Aggregate analytics.</strong> We may use privacy-respecting,
          aggregate analytics to understand overall usage. These don&rsquo;t use advertising or
          cross-site tracking cookies and don&rsquo;t identify you personally.
        </li>
      </ul>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-ink">What we don&rsquo;t do</h2>
      <p className="mt-2">
        We don&rsquo;t sell or rent your data, we don&rsquo;t run ad networks, and we don&rsquo;t use
        cross-site tracking cookies.
      </p>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-ink">About the data you see</h2>
      <p className="mt-2">
        The benefit-plan information shown in {SITE_NAME} is public record published by the U.S.
        Department of Labor (Form 5500 filings) &mdash; information employers filed with the
        government, not data we collected about you as a visitor.
      </p>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-ink">Contact</h2>
      <p className="mt-2">
        Questions about privacy? Email{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-brand underline">{CONTACT_EMAIL}</a>.
      </p>

      <Link href="/" className="mt-10 inline-block text-sm font-medium text-brand hover:underline">
        &larr; Back to search
      </Link>
    </article>
  );
}
