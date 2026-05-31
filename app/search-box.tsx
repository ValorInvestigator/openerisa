"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

const STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA",
  "ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR",
  "PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","PR","VI","GU",
];

export default function SearchBox({
  initialQ = "",
  initialState = "",
  initialForm = "",
  initialYear = "",
  autoFocus = false,
}: {
  initialQ?: string;
  initialState?: string;
  initialForm?: string;
  initialYear?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [q, setQ] = useState(initialQ);
  const [state, setState] = useState(initialState);
  const [form, setForm] = useState(initialForm);
  const [year, setYear] = useState(initialYear);
  const first = useRef(true);

  function push(next: { q: string; state: string; form: string; year: string }) {
    const p = new URLSearchParams();
    if (next.q.trim()) p.set("q", next.q.trim());
    if (next.state) p.set("state", next.state);
    if (next.form) p.set("form", next.form);
    if (next.year) p.set("year", next.year);
    const qs = p.toString();
    startTransition(() => router.replace(qs ? `/?${qs}` : "/"));
  }

  // Debounce the free-text query; push filters immediately.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => push({ q, state, form, year }), 280);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function onFilter(next: Partial<{ state: string; form: string; year: string }>) {
    const merged = { state, form, year, ...next };
    setState(merged.state);
    setForm(merged.form);
    setYear(merged.year);
    push({ q, ...merged });
  }

  const selectCls =
    "rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none";

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          push({ q, state, form, year });
        }}
        className="flex items-center gap-2 rounded-2xl border border-line bg-surface p-2.5 shadow-sm focus-within:border-brand"
      >
        <svg className="ml-2 h-6 w-6 shrink-0 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5-5m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
        <input
          autoFocus={autoFocus}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by company name or 9-digit EIN…"
          className="w-full border-0 bg-transparent px-1 py-2.5 text-lg text-ink placeholder-muted/70 focus:outline-none"
          aria-label="Search company name or EIN"
        />
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        <select className={selectCls} value={state} onChange={(e) => onFilter({ state: e.target.value })} aria-label="State">
          <option value="">All states</option>
          {STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select className={selectCls} value={form} onChange={(e) => onFilter({ form: e.target.value })} aria-label="Form type">
          <option value="">All forms</option>
          <option value="5500">Form 5500</option>
          <option value="5500-SF">Form 5500-SF</option>
        </select>
        <select className={selectCls} value={year} onChange={(e) => onFilter({ year: e.target.value })} aria-label="Filing year">
          <option value="">All years</option>
          <option value="2025">2025</option>
          <option value="2024">2024</option>
        </select>
      </div>
    </div>
  );
}
