import { einChunk, listStates } from "@/lib/queries";
import { SECTORS } from "@/lib/naics";
import { SITE_URL, SITEMAP_CHUNK, DATA_LASTMOD } from "@/lib/site";

export const revalidate = 86400;

function urlset(urls: string[]): string {
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${u}</loc><lastmod>${DATA_LASTMOD}</lastmod></url>`).join("\n") +
    `\n</urlset>\n`
  );
}

export async function GET(_req: Request, { params }: { params: Promise<{ shard: string }> }) {
  const { shard: raw } = await params;
  const shard = raw.replace(/\.xml$/, "");
  let urls: string[] = [];

  if (shard === "static") {
    urls = [
      `${SITE_URL}/`,
      `${SITE_URL}/about`,
      `${SITE_URL}/privacy`,
      `${SITE_URL}/terms`,
      `${SITE_URL}/states`,
      `${SITE_URL}/industries`,
    ];
  } else if (shard === "states") {
    const states = await listStates();
    urls = states.map((s) => `${SITE_URL}/state/${encodeURIComponent(s.state)}`);
  } else if (shard === "industries") {
    urls = SECTORS.map((s) => `${SITE_URL}/industry/${s.slug}`);
  } else if (shard.startsWith("sponsors-")) {
    const idx = Number(shard.slice("sponsors-".length));
    if (Number.isInteger(idx) && idx >= 0) {
      const eins = await einChunk(idx * SITEMAP_CHUNK, SITEMAP_CHUNK);
      urls = eins.map((e) => `${SITE_URL}/p/${e}`);
    }
  }

  return new Response(urlset(urls), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
