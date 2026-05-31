import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-2xl font-bold text-ink">Not found</h1>
      <p className="mt-2 text-sm text-muted">
        We couldn&rsquo;t find a plan sponsor for that EIN in the 2024–2025 filings.
      </p>
      <Link href="/" className="mt-6 inline-block text-sm font-medium text-brand hover:underline">
        ← Back to search
      </Link>
    </div>
  );
}
