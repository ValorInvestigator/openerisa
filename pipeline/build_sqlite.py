#!/usr/bin/env python3
"""
Build a unified, FTS-indexed SQLite for OpenERISA from DOL Form 5500 data.

Sources:
  - Postgres `valor_consolidated` for recent years already loaded there (2024, 2025).
  - Local DOL CSV extracts in pipeline/data_raw/ for back-years (2020-2023), downloaded from
    https://www.askebsa.dol.gov/FOIA Files/<YEAR>/Latest/ .

Output tables: filings (1 row/filing), sponsors (1 row/EIN), sponsors_fts (FTS5 name index).
Run:  python3 build_sqlite.py
"""
import csv, os, re, sqlite3, sys, time
import psycopg2

csv.field_size_limit(10_000_000)

PG = dict(dbname="valor_consolidated", user="levi", host="/var/run/postgresql")
HERE = os.path.dirname(__file__)
OUT = os.path.abspath(os.path.join(HERE, "..", "data", "erisa.sqlite"))
RAW = os.path.join(HERE, "data_raw")
BATCH = 5000

# Canonical positional order for every row inserted into `filings`:
#   ein, plan_num, sponsor_name, dba_name, plan_name, participants, city, state, zip, business_code

# ---- Postgres sources (years already in PG); address coalesced loc -> mailing ----
PG_SOURCES = [
    ("5500", 2024, """
        SELECT spons_dfe_ein, spons_dfe_pn, sponsor_dfe_name, spons_dfe_dba_name, plan_name,
               tot_active_partcp_cnt,
               COALESCE(NULLIF(TRIM(spons_dfe_loc_us_city),''),  spons_dfe_mail_us_city),
               COALESCE(NULLIF(TRIM(spons_dfe_loc_us_state),''), spons_dfe_mail_us_state),
               COALESCE(NULLIF(TRIM(spons_dfe_loc_us_zip),''),   spons_dfe_mail_us_zip),
               business_code FROM dol_5500_2024"""),
    ("5500", 2025, """
        SELECT spons_dfe_ein, spons_dfe_pn, sponsor_dfe_name, spons_dfe_dba_name, plan_name,
               tot_active_partcp_cnt,
               COALESCE(NULLIF(TRIM(spons_dfe_loc_us_city),''),  spons_dfe_mail_us_city),
               COALESCE(NULLIF(TRIM(spons_dfe_loc_us_state),''), spons_dfe_mail_us_state),
               COALESCE(NULLIF(TRIM(spons_dfe_loc_us_zip),''),   spons_dfe_mail_us_zip),
               business_code FROM dol_5500_2025"""),
    ("5500-SF", 2024, """
        SELECT sf_spons_ein, sf_plan_num, sf_sponsor_name, sf_sponsor_dfe_dba_name, sf_plan_name,
               sf_tot_act_partcp_eoy_cnt,
               COALESCE(NULLIF(TRIM(sf_spons_us_city),''),  sf_spons_loc_us_city),
               COALESCE(NULLIF(TRIM(sf_spons_us_state),''), sf_spons_loc_us_state),
               COALESCE(NULLIF(TRIM(sf_spons_us_zip),''),   sf_spons_loc_us_zip),
               sf_business_code FROM dol_5500_sf_2024"""),
    ("5500-SF", 2025, """
        SELECT sf_spons_ein, sf_plan_num, sf_sponsor_name, sf_sponsor_dfe_dba_name, sf_plan_name,
               sf_tot_act_partcp_eoy_cnt,
               COALESCE(NULLIF(TRIM(sf_spons_us_city),''),  sf_spons_loc_us_city),
               COALESCE(NULLIF(TRIM(sf_spons_us_state),''), sf_spons_loc_us_state),
               COALESCE(NULLIF(TRIM(sf_spons_us_zip),''),   sf_spons_loc_us_zip),
               sf_business_code FROM dol_5500_sf_2025"""),
]

# ---- CSV sources (back-years). Canonical field -> ordered candidate columns (first non-empty). ----
FULL_MAP = {
    "ein": ["spons_dfe_ein"], "plan_num": ["spons_dfe_pn"], "sponsor_name": ["sponsor_dfe_name"],
    "dba_name": ["spons_dfe_dba_name"], "plan_name": ["plan_name"],
    "participants": ["tot_active_partcp_cnt"],
    "city": ["spons_dfe_loc_us_city", "spons_dfe_mail_us_city"],
    "state": ["spons_dfe_loc_us_state", "spons_dfe_mail_us_state"],
    "zip": ["spons_dfe_loc_us_zip", "spons_dfe_mail_us_zip"],
    "business_code": ["business_code"],
}
SF_MAP = {
    "ein": ["sf_spons_ein"], "plan_num": ["sf_plan_num"], "sponsor_name": ["sf_sponsor_name"],
    "dba_name": ["sf_sponsor_dfe_dba_name"], "plan_name": ["sf_plan_name"],
    "participants": ["sf_tot_act_partcp_eoy_cnt"],
    "city": ["sf_spons_us_city", "sf_spons_loc_us_city"],
    "state": ["sf_spons_us_state", "sf_spons_loc_us_state"],
    "zip": ["sf_spons_us_zip", "sf_spons_loc_us_zip"],
    "business_code": ["sf_business_code"],
}
ORDER = ["ein", "plan_num", "sponsor_name", "dba_name", "plan_name", "participants",
         "city", "state", "zip", "business_code"]
CSV_SOURCES = []
for _y in (2023, 2022, 2021, 2020):
    CSV_SOURCES.append(("5500", _y, f"f_5500_{_y}_latest.csv", FULL_MAP))
    CSV_SOURCES.append(("5500-SF", _y, f"f_5500_sf_{_y}_latest.csv", SF_MAP))


def clean_ein(v):
    if v is None:
        return None
    s = re.sub(r"\D", "", str(v))
    return None if not s else (s.zfill(9) if len(s) < 9 else s[:9])


def clean_text(v):
    if v is None:
        return None
    s = str(v).strip()
    return s or None


def to_int(v):
    try:
        return int(float(str(v).replace(",", "").strip()))
    except (TypeError, ValueError):
        return None


def rows_from_csv(form_type, year, fname, cmap):
    path = os.path.join(RAW, fname)
    with open(path, newline="", encoding="utf-8", errors="replace") as f:
        reader = csv.reader(f)
        header = [h.strip().lower().lstrip("﻿") for h in next(reader)]
        idx = {h: i for i, h in enumerate(header)}

        def pick(field):
            for col in cmap[field]:
                j = idx.get(col)
                if j is not None and j < len(_row):
                    v = _row[j].strip()
                    if v:
                        return v
            return None

        for _row in reader:
            yield (
                clean_ein(pick("ein")), clean_text(pick("plan_num")), clean_text(pick("sponsor_name")),
                clean_text(pick("dba_name")), clean_text(pick("plan_name")), to_int(pick("participants")),
                clean_text(pick("city")), clean_text(pick("state")), clean_text(pick("zip")),
                clean_text(pick("business_code")), form_type, year,
            )


INSERT = ("INSERT INTO filings(ein,plan_num,sponsor_name,dba_name,plan_name,participants,"
          "city,state,zip,business_code,form_type,year) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)")


def insert_stream(db, stream, label):
    n, buf = 0, []
    for rec in stream:
        buf.append(rec)
        if len(buf) >= BATCH:
            db.executemany(INSERT, buf)
            n += len(buf)
            buf = []
    if buf:
        db.executemany(INSERT, buf)
        n += len(buf)
    db.commit()
    print(f"  loaded {n:>9,}  {label}", flush=True)
    return n


def main():
    t0 = time.time()
    if os.path.exists(OUT):
        os.remove(OUT)
    db = sqlite3.connect(OUT)
    db.executescript("""
        PRAGMA journal_mode = OFF;
        PRAGMA synchronous = OFF;
        PRAGMA temp_store = MEMORY;
        CREATE TABLE filings (
            id INTEGER PRIMARY KEY,
            ein TEXT, plan_num TEXT, sponsor_name TEXT, dba_name TEXT, plan_name TEXT,
            participants INTEGER, city TEXT, state TEXT, zip TEXT,
            business_code TEXT, form_type TEXT, year INTEGER
        );
    """)

    total = 0
    pg = psycopg2.connect(**PG)
    for form_type, year, sql in PG_SOURCES:
        cur = pg.cursor(name=f"src_{form_type}_{year}")
        cur.itersize = BATCH
        cur.execute(sql)
        def gen(c=cur, ft=form_type, yr=year):
            while True:
                rows = c.fetchmany(BATCH)
                if not rows:
                    break
                for r in rows:
                    ein, pn, sp, dba, pl, part, city, st, zp, bc = r
                    yield (clean_ein(ein), clean_text(pn), clean_text(sp), clean_text(dba),
                           clean_text(pl), to_int(part), clean_text(city), clean_text(st),
                           clean_text(zp), clean_text(bc), ft, yr)
        total += insert_stream(db, gen(), f"{form_type} {year}  (pg)")
        cur.close()
    pg.close()

    for form_type, year, fname, cmap in CSV_SOURCES:
        total += insert_stream(db, rows_from_csv(form_type, year, fname, cmap), f"{form_type} {year}  (csv)")

    print(f"filings total: {total:,}  ({time.time()-t0:.0f}s)", flush=True)

    print("indexes on filings...", flush=True)
    db.executescript("""
        CREATE INDEX ix_filings_ein   ON filings(ein);
        CREATE INDEX ix_filings_state ON filings(state);
        CREATE INDEX ix_filings_naics ON filings(business_code);
        CREATE INDEX ix_filings_year  ON filings(year);
    """)

    print("building sponsors (1 row/EIN, latest address-complete display)...", flush=True)
    db.executescript("""
        CREATE TABLE sponsors AS
        WITH ranked AS (
            SELECT *, ROW_NUMBER() OVER (
                PARTITION BY ein
                ORDER BY (state IS NOT NULL) DESC, (sponsor_name IS NOT NULL) DESC, year DESC, id DESC
            ) rn
            FROM filings WHERE ein IS NOT NULL
        ),
        agg AS (
            SELECT ein,
                   COUNT(DISTINCT plan_num)    AS plan_count,
                   SUM(participants)           AS total_participants,
                   GROUP_CONCAT(DISTINCT year) AS years,
                   MAX(year)                   AS latest_year
            FROM filings WHERE ein IS NOT NULL GROUP BY ein
        )
        SELECT r.ein, r.sponsor_name, r.dba_name, r.city, r.state, r.zip, r.business_code,
               NULLIF(SUBSTR(r.business_code, 1, 2), '') AS sector,
               a.plan_count, a.total_participants, a.years, a.latest_year
        FROM ranked r JOIN agg a ON a.ein = r.ein
        WHERE r.rn = 1;

        CREATE UNIQUE INDEX ix_sponsors_ein         ON sponsors(ein);
        CREATE INDEX ix_sponsors_state              ON sponsors(state);
        CREATE INDEX ix_sponsors_state_name         ON sponsors(state, sponsor_name);
        CREATE INDEX ix_sponsors_sector_name        ON sponsors(sector, sponsor_name);
    """)

    print("building FTS5 name index...", flush=True)
    db.executescript("""
        CREATE VIRTUAL TABLE sponsors_fts USING fts5(
            ein UNINDEXED, sponsor_name, dba_name, tokenize='unicode61'
        );
        INSERT INTO sponsors_fts(ein, sponsor_name, dba_name)
            SELECT ein, sponsor_name, COALESCE(dba_name,'') FROM sponsors;
    """)

    f = db.execute("SELECT COUNT(*) FROM filings").fetchone()[0]
    s = db.execute("SELECT COUNT(*) FROM sponsors").fetchone()[0]
    yr = db.execute("SELECT MIN(year), MAX(year) FROM filings").fetchone()
    db.execute("PRAGMA optimize")
    db.execute("PRAGMA journal_mode=WAL")        # Turso --from-file upload requires WAL mode
    db.execute("PRAGMA wal_checkpoint(TRUNCATE)")
    db.commit()
    db.close()
    size_mb = os.path.getsize(OUT) / 1e6
    print(f"\nDONE  filings={f:,}  sponsors={s:,}  years={yr[0]}-{yr[1]}  "
          f"file={size_mb:.0f} MB  ({time.time()-t0:.0f}s)")
    print(f"  -> {OUT}")


if __name__ == "__main__":
    main()
