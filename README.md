# Valor ERISA / Form 5500 Lookup

Free, no-login, national Form 5500 search. Originated as a resource for Mary Lou Hennrich
(founding CEO CareOregon) and partners, who couldn't easily pull provider ERISA info; also a
nationwide-SEO/traffic asset for Valor. Will deploy as a standalone Next.js app on
`erisa.valor-investigations.com` backed by an edge SQLite (Turso/D1). Full design:
`~/Desktop/OHSU/ERISA_TOOL_SPEC.md`.

## Status
- **P0 (data pipeline) — DONE.** `pipeline/build_sqlite.py` reads the four DOL Form 5500 tables
  from Postgres `valor_consolidated` and emits `data/erisa.sqlite`.
- P1 search app + edge-DB load, P2 ISR provider pages, P3 sitemaps/hubs/SEO — pending.

## Pipeline
```
python3 pipeline/build_sqlite.py     # read-only on PG; writes data/erisa.sqlite (~392 MB)
```
Source tables: `dol_5500_2024`, `dol_5500_2025`, `dol_5500_sf_2024`, `dol_5500_sf_2025`.
Output: 1,111,601 filings → 852,435 distinct sponsor EINs (2024 + 2025). Build ~11s.

## Output schema (data/erisa.sqlite)
- `filings` — one row per filing: ein, plan_num, sponsor_name, dba_name, plan_name,
  participants, city, state, zip, business_code (NAICS), form_type ('5500'/'5500-SF'), year.
- `sponsors` — one row per EIN: display name (address-complete, latest year), dba, city/state/zip,
  business_code, plan_count, total_participants, years, latest_year.
- `sponsors_fts` — FTS5 over sponsor_name + dba_name (name→EIN search / autocomplete).
Indexes on filings(ein,state,business_code,year) and sponsors(ein,state,business_code).

## Data notes / gotchas
- EINs normalized to 9-digit strings (digits-only, zero-padded). All 852,435 sponsors pass.
- Full-form plan number is `spons_dfe_pn` (NOT `last_rpt_plan_num`, which is the prior number and
  usually null). Short-form uses `sf_plan_num`.
- Address = COALESCE(location, mailing) per filing; many filers populate only one. 326 sponsors
  (0.04%) still have no state (address-less/foreign).
- `year` = the DOL dataset/filing year (2024/2025), not necessarily the plan year.
- `total_participants` is a SUM across a sponsor's plans (rough size signal; can overcount people
  in multiple plans). Per-plan counts on the filing rows are exact.
- Scope today = 2024–2025 only. Backfilling prior years = re-point SOURCES at older DOL tables.

## Company → EIN
Search is name-first (FTS5), so the 5500 set already resolves name→EIN for all filers.
To broaden to orgs without a 5500: fold in IRS Exempt-Org BMF (nonprofits) + SEC EDGAR
(public cos). No free/legal source covers private-company EINs.
