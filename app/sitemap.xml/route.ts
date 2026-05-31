import { sponsorCount } from "@/lib/queries";
import { SITE_URL, SITEMAP_CHUNK, DATA_LASTMOD } from "@/lib/site";

export const revalidate = 86400;

export async function GET() {
  const count = await sponsorCount();
  const chunks = Math.max(1, Math.ceil(count / SITEMAP_CHUNK));
  const maps = ["static", "states", "industries"];
  for (let i = 0; i < chunks; i++) maps.push(`sponsors-${i}`);

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    maps
      .map(
        (m) =>
          `  <sitemap><loc>${SITE_URL}/sitemaps/${m}.xml</loc><lastmod>${DATA_LASTMOD}</lastmod></sitemap>`,
      )
      .join("\n") +
    `\n</sitemapindex>\n`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
