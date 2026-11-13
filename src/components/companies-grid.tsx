"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { CompanyLogo } from "@/components/company-logo";
import { DifficultyBar } from "@/components/difficulty-badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserState } from "@/lib/store";
import type { CompanySummary } from "@/lib/types";
import { useSiteIndex } from "@/lib/use-site-index";

type Sort = "total" | "recent" | "name";

/** Solved-question count per company, computed from the shared index */
export function useSolvedByCompany() {
  const index = useSiteIndex();
  const { solved } = useUserState();
  return useMemo(() => {
    const m = new Map<string, number>();
    if (!index) return m;
    for (const q of index.questions) {
      if (!solved[q.slug]) continue;
      for (const c of q.companies) m.set(c, (m.get(c) ?? 0) + 1);
    }
    return m;
  }, [index, solved]);
}

export function CompanyCard({ c, solved }: { c: CompanySummary; solved: number }) {
  return (
    <Link
      href={`/companies/${c.slug}`}
      className="group flex flex-col gap-3 rounded-xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <CompanyLogo name={c.name} domain={c.domain} logo={c.logo} size={40} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium group-hover:text-brand">{c.name}</p>
          <p className="text-xs text-muted-foreground tabular-nums">
            {c.total} questions{c.recent > 0 && <> · {c.recent} in 30d</>}
          </p>
        </div>
      </div>
      <DifficultyBar easy={c.easy} medium={c.medium} hard={c.hard} />
      <div className="flex items-center justify-between text-xs tabular-nums">
        <span className="flex gap-2">
          <span className="text-easy">{c.easy}E</span>
          <span className="text-medium">{c.medium}M</span>
          <span className="text-hard">{c.hard}H</span>
        </span>
        <span className="text-muted-foreground">
          {solved > 0 ? (
            <>
              <span className="font-medium text-foreground">{solved}</span> solved ·{" "}
              {Math.round((solved / c.total) * 100)}%
            </>
          ) : (
            "Not started"
          )}
        </span>
      </div>
    </Link>
  );
}

export function CompaniesGrid({ companies }: { companies: CompanySummary[] }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("total");
  const solvedBy = useSolvedByCompany();

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    const l = companies.filter((c) => c.name.toLowerCase().includes(term));
    if (sort === "name") return [...l].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "recent") return [...l].sort((a, b) => b.recent - a.recent || b.total - a.total);
    return l;
  }, [companies, q, sort]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${companies.length} companies…`}
            className="h-9 pl-8"
            aria-label="Search companies"
          />
        </div>
        <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
          <SelectTrigger className="h-9 w-full sm:w-52" aria-label="Sort companies">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="total">Most questions</SelectItem>
            <SelectItem value="recent">Most asked in 30 days</SelectItem>
            <SelectItem value="name">Name A–Z</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground tabular-nums">{list.length}</span> companies
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {list.map((c) => (
          <CompanyCard key={c.slug} c={c} solved={solvedBy.get(c.slug) ?? 0} />
        ))}
      </div>
      {list.length === 0 && <p className="py-12 text-center text-muted-foreground">No company matches “{q}”.</p>}
    </div>
  );
}

export function TopCompanies({ companies }: { companies: CompanySummary[] }) {
  const solvedBy = useSolvedByCompany();
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {companies.map((c) => (
        <CompanyCard key={c.slug} c={c} solved={solvedBy.get(c.slug) ?? 0} />
      ))}
    </div>
  );
}
