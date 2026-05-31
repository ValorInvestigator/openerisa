import Link from "next/link";

export default function Pager({
  basePath,
  page,
  totalPages,
}: {
  basePath: string;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;
  const href = (p: number) => (p <= 1 ? basePath : `${basePath}/${p}`);
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  const nums: number[] = [];
  for (let i = start; i <= end; i++) nums.push(i);

  const link = "rounded-lg border border-line bg-surface px-3 py-1.5 text-sm hover:border-brand";
  const cur = "rounded-lg border border-brand bg-brand px-3 py-1.5 text-sm font-semibold text-white";

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      {page > 1 && <Link href={href(page - 1)} className={link} rel="prev">‹ Prev</Link>}
      {start > 1 && (
        <>
          <Link href={href(1)} className={link}>1</Link>
          {start > 2 && <span className="px-1 text-muted">…</span>}
        </>
      )}
      {nums.map((n) =>
        n === page ? (
          <span key={n} className={cur} aria-current="page">{n}</span>
        ) : (
          <Link key={n} href={href(n)} className={link}>{n}</Link>
        ),
      )}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-muted">…</span>}
          <Link href={href(totalPages)} className={link}>{totalPages}</Link>
        </>
      )}
      {page < totalPages && <Link href={href(page + 1)} className={link} rel="next">Next ›</Link>}
    </nav>
  );
}
