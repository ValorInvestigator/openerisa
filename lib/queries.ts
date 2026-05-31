import { db } from "./db";

export interface SponsorRow {
  ein: string;
  sponsor_name: string;
  dba_name: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  business_code: string | null;
  plan_count: number;
  total_participants: number | null;
  years: string | null;
  latest_year: number | null;
}

export interface PlanRow {
  year: number;
  form_type: string;
  plan_num: string | null;
  plan_name: string | null;
  participants: number | null;
}

export interface SearchInput {
  q?: string;
  state?: string;
  form?: string;
  year?: string;
}

export type SearchMode = "empty" | "name" | "ein";

const SPONSOR_COLS =
  "s.ein, s.sponsor_name, s.dba_name, s.city, s.state, s.zip, s.business_code, " +
  "s.plan_count, s.total_participants, s.years, s.latest_year";

/** Build an FTS5 prefix-AND match expression from free text. */
function ftsExpr(raw: string): string | null {
  const toks = raw
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 8);
  if (!toks.length) return null;
  return toks.map((t) => `${t}*`).join(" ");
}

/** If the query looks like an EIN, return the 9-digit normalized form. */
function einDigits(raw: string): string | null {
  if (!/^[\d\s-]+$/.test(raw)) return null;
  const d = raw.replace(/\D/g, "");
  return d.length >= 7 && d.length <= 9 ? d.padStart(9, "0") : null;
}

export async function search(
  input: SearchInput,
  limit = 40,
  offset = 0,
): Promise<{ rows: SponsorRow[]; mode: SearchMode }> {
  const q = (input.q ?? "").trim();
  if (!q) return { rows: [], mode: "empty" };

  // Filters shared by both paths (applied to the sponsor `s`).
  const filters: string[] = [];
  const fArgs: (string | number)[] = [];
  if (input.state) {
    filters.push("s.state = ?");
    fArgs.push(input.state.toUpperCase());
  }
  if (input.year) {
    filters.push("EXISTS (SELECT 1 FROM filings fl WHERE fl.ein = s.ein AND fl.year = ?)");
    fArgs.push(Number(input.year));
  }
  if (input.form) {
    filters.push("EXISTS (SELECT 1 FROM filings fl WHERE fl.ein = s.ein AND fl.form_type = ?)");
    fArgs.push(input.form);
  }
  const filterSql = filters.length ? " AND " + filters.join(" AND ") : "";

  const ein = einDigits(q);
  if (ein) {
    const sql = `SELECT ${SPONSOR_COLS} FROM sponsors s WHERE s.ein = ?${filterSql} LIMIT ? OFFSET ?`;
    const res = await db.execute({ sql, args: [ein, ...fArgs, limit, offset] });
    return { rows: res.rows as unknown as SponsorRow[], mode: "ein" };
  }

  const expr = ftsExpr(q);
  if (!expr) return { rows: [], mode: "empty" };
  const sql =
    `SELECT ${SPONSOR_COLS} FROM sponsors_fts f JOIN sponsors s ON s.ein = f.ein ` +
    `WHERE sponsors_fts MATCH ?${filterSql} ORDER BY bm25(sponsors_fts) LIMIT ? OFFSET ?`;
  const res = await db.execute({ sql, args: [expr, ...fArgs, limit, offset] });
  return { rows: res.rows as unknown as SponsorRow[], mode: "name" };
}

export async function getSponsor(ein: string): Promise<SponsorRow | null> {
  const d = ein.replace(/\D/g, "").padStart(9, "0");
  const res = await db.execute({
    sql: `SELECT ${SPONSOR_COLS} FROM sponsors s WHERE s.ein = ? LIMIT 1`,
    args: [d],
  });
  return (res.rows[0] as unknown as SponsorRow) ?? null;
}

export async function getPlans(ein: string): Promise<PlanRow[]> {
  const d = ein.replace(/\D/g, "").padStart(9, "0");
  const res = await db.execute({
    sql:
      "SELECT year, form_type, plan_num, plan_name, participants FROM filings " +
      "WHERE ein = ? ORDER BY year DESC, plan_num",
    args: [d],
  });
  return res.rows as unknown as PlanRow[];
}

// ---------- hub + sitemap queries ----------

export interface StateCount { state: string; count: number; }

export async function sponsorCount(): Promise<number> {
  const r = await db.execute("SELECT COUNT(*) AS c FROM sponsors");
  return Number((r.rows[0] as Record<string, unknown>).c);
}

export async function listStates(): Promise<StateCount[]> {
  const r = await db.execute(
    "SELECT state, COUNT(*) AS count FROM sponsors WHERE state IS NOT NULL " +
      "GROUP BY state ORDER BY count DESC",
  );
  return r.rows as unknown as StateCount[];
}

export async function countByState(state: string): Promise<number> {
  const r = await db.execute({
    sql: "SELECT COUNT(*) AS c FROM sponsors WHERE state = ?",
    args: [state],
  });
  return Number((r.rows[0] as Record<string, unknown>).c);
}

export async function sponsorsByState(state: string, page: number, size: number): Promise<SponsorRow[]> {
  const r = await db.execute({
    sql: `SELECT ${SPONSOR_COLS} FROM sponsors s WHERE s.state = ? ORDER BY s.sponsor_name LIMIT ? OFFSET ?`,
    args: [state, size, (page - 1) * size],
  });
  return r.rows as unknown as SponsorRow[];
}

/** Map of 2-digit sector prefix -> sponsor count. */
export async function sectorCounts(): Promise<Record<string, number>> {
  const r = await db.execute(
    "SELECT sector, COUNT(*) AS count FROM sponsors WHERE sector IS NOT NULL GROUP BY sector",
  );
  const m: Record<string, number> = {};
  for (const row of r.rows as unknown as { sector: string; count: number }[]) {
    m[String(row.sector)] = Number(row.count);
  }
  return m;
}

export async function countBySector(prefixes: string[]): Promise<number> {
  const ph = prefixes.map(() => "?").join(",");
  const r = await db.execute({
    sql: `SELECT COUNT(*) AS c FROM sponsors WHERE sector IN (${ph})`,
    args: prefixes,
  });
  return Number((r.rows[0] as Record<string, unknown>).c);
}

export async function sponsorsBySector(prefixes: string[], page: number, size: number): Promise<SponsorRow[]> {
  const ph = prefixes.map(() => "?").join(",");
  const r = await db.execute({
    sql: `SELECT ${SPONSOR_COLS} FROM sponsors s WHERE s.sector IN (${ph}) ` +
      `ORDER BY s.sponsor_name LIMIT ? OFFSET ?`,
    args: [...prefixes, size, (page - 1) * size],
  });
  return r.rows as unknown as SponsorRow[];
}

export async function siblingsInState(state: string, excludeEin: string, limit: number): Promise<SponsorRow[]> {
  const r = await db.execute({
    sql: `SELECT ${SPONSOR_COLS} FROM sponsors s WHERE s.state = ? AND s.ein <> ? ` +
      `ORDER BY s.sponsor_name LIMIT ?`,
    args: [state, excludeEin, limit],
  });
  return r.rows as unknown as SponsorRow[];
}

/** EINs for a sitemap chunk, deterministically ordered. */
export async function einChunk(offset: number, limit: number): Promise<string[]> {
  const r = await db.execute({
    sql: "SELECT ein FROM sponsors ORDER BY ein LIMIT ? OFFSET ?",
    args: [limit, offset],
  });
  return (r.rows as unknown as { ein: string }[]).map((x) => String(x.ein));
}
