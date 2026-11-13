"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, ChevronLeft, ChevronRight, ExternalLink, Search, X } from "lucide-react";
import { CompanyLogo } from "@/components/company-logo";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserState } from "@/lib/store";
import { DIFFICULTIES, PERIODS, type CompanySummary, type TableQuestion } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BookmarkToggle, SolvedToggle } from "./question-actions";
import { NoteDialog } from "./note-dialog";

type Sort = "frequency" | "companies" | "acceptance-asc" | "acceptance-desc" | "title" | "difficulty";
type Status = "all" | "solved" | "unsolved" | "bookmarked" | "notes";

const PAGE_SIZE = 50;
const DIFF_ORDER = { Easy: 0, Medium: 1, Hard: 2 } as const;

export interface QuestionTableProps {
  questions: TableQuestion[];
  /** slug -> company, enables the companies column + company filter */
  companies?: Record<string, Pick<CompanySummary, "name" | "slug" | "domain" | "logo">>;
  /** show the time-window tabs (company pages) */
  showPeriods?: boolean;
  defaultSort?: Sort;
  emptyMessage?: string;
}

export function QuestionTable({
  questions,
  companies,
  showPeriods = false,
  defaultSort = "frequency",
  emptyMessage = "No questions match these filters.",
}: QuestionTableProps) {
  const user = useUserState();
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [period, setPeriod] = useState<string>("all");
  const [topic, setTopic] = useState<string>("all");
  const [company, setCompany] = useState<string>("all");
  const [status, setStatus] = useState<Status>("all");
  const [sort, setSort] = useState<Sort>(defaultSort);
  const [page, setPage] = useState(0);

  // allow deep links such as /questions?topic=Graph&q=island
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    /* eslint-disable react-hooks/set-state-in-effect -- one-time sync from the URL after mount */
    if (p.get("q")) setQuery(p.get("q")!);
    if (p.get("topic")) setTopic(p.get("topic")!);
    if (p.get("difficulty")) setDifficulty(p.get("difficulty")!);
    if (p.get("company")) setCompany(p.get("company")!);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const topics = useMemo(() => {
    const s = new Set<string>();
    questions.forEach((q) => q.topics.forEach((t) => s.add(t)));
    return [...s].sort();
  }, [questions]);

  const companyList = useMemo(
    () => (companies ? Object.values(companies).sort((a, b) => a.name.localeCompare(b.name)) : []),
    [companies],
  );

  const periodCounts = useMemo(() => {
    const counts: Record<string, number> = { all: questions.length };
    for (const p of PERIODS) counts[p.value] = questions.filter((q) => q.periods?.includes(p.value)).length;
    return counts;
  }, [questions]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const list = questions.filter((q) => {
      if (term && !q.title.toLowerCase().includes(term) && !q.topics.some((t) => t.toLowerCase().includes(term)))
        return false;
      if (difficulty !== "all" && q.difficulty !== difficulty) return false;
      if (period !== "all" && !q.periods?.includes(period as never)) return false;
      if (topic !== "all" && !q.topics.includes(topic)) return false;
      if (company !== "all" && !q.companies?.includes(company)) return false;
      if (status === "solved" && !user.solved[q.slug]) return false;
      if (status === "unsolved" && user.solved[q.slug]) return false;
      if (status === "bookmarked" && !user.bookmarks[q.slug]) return false;
      if (status === "notes" && !user.notes[q.slug]) return false;
      return true;
    });
    const by: Record<Sort, (a: TableQuestion, b: TableQuestion) => number> = {
      frequency: (a, b) => b.frequency - a.frequency,
      companies: (a, b) => (b.companies?.length ?? 0) - (a.companies?.length ?? 0),
      "acceptance-asc": (a, b) => a.acceptance - b.acceptance,
      "acceptance-desc": (a, b) => b.acceptance - a.acceptance,
      title: (a, b) => a.title.localeCompare(b.title),
      difficulty: (a, b) => DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty],
    };
    return [...list].sort((a, b) => by[sort](a, b) || a.title.localeCompare(b.title));
  }, [questions, query, difficulty, period, topic, company, status, sort, user]);

  // reset to the first page whenever the filters change
  const filterKey = [query, difficulty, period, topic, company, status, sort].join("|");
  const [lastKey, setLastKey] = useState(filterKey);
  if (lastKey !== filterKey) {
    setLastKey(filterKey);
    setPage(0);
  }

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const rows = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);
  const counts = useMemo(() => {
    const c = { Easy: 0, Medium: 0, Hard: 0, solved: 0 };
    filtered.forEach((q) => {
      c[q.difficulty]++;
      if (user.solved[q.slug]) c.solved++;
    });
    return c;
  }, [filtered, user.solved]);

  const hasFilters =
    query || difficulty !== "all" || period !== "all" || topic !== "all" || company !== "all" || status !== "all";
  const reset = () => {
    setQuery("");
    setDifficulty("all");
    setPeriod("all");
    setTopic("all");
    setCompany("all");
    setStatus("all");
  };

  return (
    <div className="space-y-4">
      {showPeriods && (
        <Tabs value={period} onValueChange={setPeriod}>
          <TabsList className="h-auto flex-wrap">
            <TabsTrigger value="all">
              All time <Count n={periodCounts.all} />
            </TabsTrigger>
            {PERIODS.map((p) => (
              <TabsTrigger key={p.value} value={p.value} disabled={periodCounts[p.value] === 0}>
                {p.label} <Count n={periodCounts[p.value]} />
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or topic…"
            className="h-9 pl-8"
            aria-label="Search questions"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <FilterSelect value={difficulty} onChange={setDifficulty} label="Difficulty" all="All difficulties"
            options={DIFFICULTIES.map((d) => ({ value: d, label: d }))} />
          <FilterSelect value={topic} onChange={setTopic} label="Topic" all="All topics"
            options={topics.map((t) => ({ value: t, label: t }))} />
          {companies && (
            <FilterSelect value={company} onChange={setCompany} label="Company" all="All companies"
              options={companyList.map((c) => ({ value: c.slug, label: c.name }))} />
          )}
          <FilterSelect value={status} onChange={(v) => setStatus(v as Status)} label="Status" all="Any status"
            options={[
              { value: "solved", label: "Solved" },
              { value: "unsolved", label: "Unsolved" },
              { value: "bookmarked", label: "Bookmarked" },
              { value: "notes", label: "Has notes" },
            ]} />
          <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
            <SelectTrigger className="h-9 w-full sm:w-44" aria-label="Sort by">
              <ArrowUpDown className="size-3.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="frequency">Most frequent</SelectItem>
              {companies && <SelectItem value="companies">Most companies</SelectItem>}
              <SelectItem value="difficulty">Difficulty</SelectItem>
              <SelectItem value="acceptance-asc">Acceptance ↑</SelectItem>
              <SelectItem value="acceptance-desc">Acceptance ↓</SelectItem>
              <SelectItem value="title">Title A–Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span>
          <span className="font-medium text-foreground tabular-nums">{filtered.length.toLocaleString()}</span> questions
        </span>
        <span className="text-easy tabular-nums">{counts.Easy} easy</span>
        <span className="text-medium tabular-nums">{counts.Medium} medium</span>
        <span className="text-hard tabular-nums">{counts.Hard} hard</span>
        <span className="tabular-nums">{counts.solved} solved</span>
        {hasFilters && (
          <Button variant="ghost" size="xs" onClick={reset}>
            <X /> Clear filters
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10 pl-3">
                <span className="sr-only">Solved</span>
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-24">Difficulty</TableHead>
              <TableHead className="hidden w-24 text-right md:table-cell">Acceptance</TableHead>
              <TableHead className="hidden w-32 lg:table-cell">Frequency</TableHead>
              {companies && <TableHead className="hidden w-40 xl:table-cell">Companies</TableHead>}
              <TableHead className="w-20 pr-3 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
            {rows.map((q) => (
              <TableRow key={q.slug} className={cn(user.solved[q.slug] && "bg-easy/[0.04]")}>
                <TableCell className="pl-3">
                  <SolvedToggle slug={q.slug} title={q.title} />
                </TableCell>
                <TableCell className="max-w-0 min-w-56 whitespace-normal">
                  <a
                    href={q.link}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-1.5 font-medium hover:text-brand"
                  >
                    {q.title}
                    <ExternalLink className="size-3 opacity-0 transition-opacity group-hover:opacity-60" />
                  </a>
                  {q.topics.length > 0 && (
                    <div className="mt-1 hidden flex-wrap gap-1 sm:flex">
                      {q.topics.slice(0, 4).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTopic(t)}
                          className="rounded bg-muted px-1.5 py-px text-[11px] text-muted-foreground hover:text-foreground"
                        >
                          {t}
                        </button>
                      ))}
                      {q.topics.length > 4 && (
                        <span className="px-1 text-[11px] text-muted-foreground" title={q.topics.slice(4).join(", ")}>
                          +{q.topics.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <DifficultyBadge difficulty={q.difficulty} />
                </TableCell>
                <TableCell className="hidden text-right text-muted-foreground tabular-nums md:table-cell">
                  {q.acceptance.toFixed(1)}%
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex items-center gap-2" title={`Frequency ${q.frequency}`}>
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-brand" style={{ width: `${q.frequency}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">{Math.round(q.frequency)}</span>
                  </div>
                </TableCell>
                {companies && (
                  <TableCell className="hidden xl:table-cell">
                    <CompanyStack slugs={q.companies ?? []} companies={companies} />
                  </TableCell>
                )}
                <TableCell className="pr-3">
                  <div className="flex justify-end gap-0.5">
                    <BookmarkToggle slug={q.slug} title={q.title} />
                    <NoteDialog slug={q.slug} title={q.title} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="tabular-nums">
            {current * PAGE_SIZE + 1}–{Math.min((current + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled={current === 0} onClick={() => setPage(current - 1)}>
              <ChevronLeft /> Prev
            </Button>
            <span className="px-2 tabular-nums">
              {current + 1} / {pages}
            </span>
            <Button variant="outline" size="sm" disabled={current >= pages - 1} onClick={() => setPage(current + 1)}>
              Next <ChevronRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Count({ n }: { n: number }) {
  return <span className="ml-1 text-xs text-muted-foreground tabular-nums">{n}</span>;
}

function FilterSelect({
  value,
  onChange,
  label,
  all,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  all: string;
  options: { value: string; label: string }[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("h-9 w-full sm:w-40", value !== "all" && "border-brand/50")} aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-80">
        <SelectItem value="all">{all}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function CompanyStack({
  slugs,
  companies,
}: {
  slugs: string[];
  companies: NonNullable<QuestionTableProps["companies"]>;
}) {
  const shown = slugs.slice(0, 4).map((s) => companies[s]).filter(Boolean);
  return (
    <div className="flex items-center">
      <div className="flex -space-x-1.5">
        {shown.map((c) => (
          <Link key={c.slug} href={`/companies/${c.slug}`} title={c.name} className="rounded-md ring-2 ring-card">
            <CompanyLogo name={c.name} domain={c.domain} logo={c.logo} size={22} />
          </Link>
        ))}
      </div>
      {slugs.length > 4 && (
        <span className="ml-2 text-xs text-muted-foreground tabular-nums" title={`${slugs.length} companies`}>
          +{slugs.length - 4}
        </span>
      )}
    </div>
  );
}
