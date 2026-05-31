import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

const SITE = "OpenERISA";
const DESC =
  "Free, no-login search of U.S. Department of Labor Form 5500 filings. Look up any employer " +
  "benefit plan by company name or EIN — sponsors, plans, participants, and locations.";

export const metadata: Metadata = {
  metadataBase: new URL("https://erisa.valor-investigations.com"),
  title: { default: `${SITE} — Free Form 5500 / ERISA Plan Search`, template: `%s | ${SITE}` },
  description: DESC,
  applicationName: SITE,
  openGraph: { title: SITE, description: DESC, siteName: SITE, type: "website" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-line bg-surface">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
            <Link href="/" className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold tracking-tight text-brand">
                Open<span className="text-accent">ERISA</span>
              </span>
              <span className="hidden text-xs font-medium text-muted sm:inline">
                Form 5500 plan search
              </span>
            </Link>
            <nav className="flex items-center gap-5 text-sm font-medium text-muted">
              <Link href="/states" className="hover:text-ink">Browse</Link>
              <Link href="/about" className="hover:text-ink">About</Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>

        <footer className="mt-16 border-t border-line bg-surface">
          <div className="mx-auto max-w-6xl px-6 py-8 text-xs leading-relaxed text-muted">
            <p>
              <strong className="text-ink">OpenERISA</strong> is a free, public lookup of
              employee benefit plan filings (Form 5500 / 5500-SF). Source data: U.S. Department of
              Labor, Employee Benefits Security Administration (EBSA), filing years 2024–2025. Data
              is shown as filed and is not validated or endorsed by OpenERISA. For official records
              see the DOL{" "}
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
            <p className="mt-3">
              A public-interest project by{" "}
              <a
                className="font-medium text-brand underline"
                href="https://www.valor-investigations.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Valor Investigations
              </a>
              .
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
