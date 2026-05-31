# Deploying OpenERISA

Target: **erisa.valor-investigations.com** (standalone Vercel project, separate from the main site).
Stack: Next.js 16 (App Router) + Turso (libSQL) `erisa` db.

## 0. Prerequisite — load the Turso `erisa` db
The production app reads from Turso (Vercel can't host the 1.2 GB SQLite). Run once (and on each
data refresh). NOTE: as of build time, Turso's multipart-upload endpoint was returning transient
502s; retry until it succeeds (their API is otherwise healthy):

```bash
cd ~/projects/valor-erisa-lookup
# (rebuild only if data changed)  python3 pipeline/build_sqlite.py
~/.turso/turso db destroy erisa --yes 2>/dev/null   # if a stale/empty one exists
~/.turso/turso db create erisa --from-file data/erisa.sqlite --group default
~/.turso/turso db show erisa --url            # -> TURSO_DATABASE_URL
~/.turso/turso db tokens create erisa         # -> TURSO_AUTH_TOKEN
```
The file must be in WAL mode (the pipeline sets this automatically).

## 1. Repo
```bash
cd ~/projects/valor-erisa-lookup
git init && git add -A && git commit -m "OpenERISA: Form 5500 lookup"
# create the GitHub repo (ValorInvestigator) and push, OR skip and use the Vercel CLI directly.
```
`.gitignore` already excludes `.env*`, `data/*.sqlite`, and `pipeline/data_raw/` (the multi-GB raw
DOL CSVs) — nothing large or secret is committed.

## 2. Vercel project
- New Vercel project from this repo (framework auto-detects **Next.js**), OR `vercel link` via CLI.
- Keep it a **separate project** from the main valor-investigations site.

## 3. Environment variables (Vercel → Settings → Environment Variables)
```
TURSO_DATABASE_URL = libsql://erisa-valorinvestigator.aws-us-west-2.turso.io
TURSO_AUTH_TOKEN   = <from `turso db tokens create erisa`>
```
(Values are also kept locally in `.env.local` and `~/.claude/keys/turso-erisa.json`.)

## 4. Deploy
- `vercel --prod` (CLI) or push to the connected branch. Build = `next build`.

## 5. Domain + DNS
- Vercel → project → Domains → add `erisa.valor-investigations.com`.
- At the DNS host for valor-investigations.com, add the record Vercel shows
  (CNAME `erisa` → `cname.vercel-dns.com`, or the A/ALIAS Vercel specifies).

## 6. Search Console (the traffic switch)
- Add `https://erisa.valor-investigations.com` as a property in Google Search Console.
- Submit `https://erisa.valor-investigations.com/sitemap.xml`.
- (Optional) Bing Webmaster Tools too.

## Data refresh (monthly, when DOL republishes)
```bash
# add/refresh raw CSVs in pipeline/data_raw/ as needed, then:
python3 pipeline/build_sqlite.py          # rebuild data/erisa.sqlite (WAL)
~/.turso/turso db destroy erisa --yes
~/.turso/turso db create erisa --from-file data/erisa.sqlite --group default
~/.turso/turso db tokens create erisa     # token rotates -> update Vercel env + redeploy
```

## Routes (what's live)
- `/` search (name-first + EIN) · `/p/[ein]` provider pages (ISR, JSON-LD)
- `/states`, `/state/[st]`, `/state/[st]/[page]` · `/industries`, `/industry/[slug]`, `/industry/[slug]/[page]`
- `/sitemap.xml` (index) → `/sitemaps/*.xml` (27 sitemaps; ~1.07M URLs) · `/robots.txt` · `/about`
