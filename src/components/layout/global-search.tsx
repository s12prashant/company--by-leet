"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Search } from "lucide-react";
import { CompanyLogo } from "@/components/company-logo";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { Input } from "@/components/ui/input";
import { useSiteIndex } from "@/lib/use-site-index";
import { cn } from "@/lib/utils";

type Result =
  | { kind: "company"; key: string; href: string; name: string; domain: string; logo?: string; total: number }
  | { kind: "question"; key: string; href: string; title: string; difficulty: "Easy" | "Medium" | "Hard"; companies: number };

export function GlobalSearch() {
  const index = useSiteIndex();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && /INPUT|TEXTAREA/.test(e.target.tagName);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, []);

  const results = useMemo<Result[]>(() => {
    const term = q.trim().toLowerCase();
    if (!index || !term) return [];
    const companies: Result[] = index.companies
      .filter((c) => c.name.toLowerCase().includes(term))
      .slice(0, 5)
      .map((c) => ({ kind: "company", key: `c-${c.slug}`, href: `/companies/${c.slug}`, name: c.name, domain: c.domain, logo: c.logo, total: c.total }));
    const questions: Result[] = index.questions
      .filter((x) => x.title.toLowerCase().includes(term))
      .slice(0, 8)
      .map((x) => ({ kind: "question", key: `q-${x.slug}`, href: x.link, title: x.title, difficulty: x.difficulty, companies: x.companies.length }));
    return [...companies, ...questions];
  }, [index, q]);

  const go = (r: Result) => {
    setOpen(false);
    setQ("");
    if (r.kind === "company") router.push(r.href);
    else window.open(r.href, "_blank", "noopener,noreferrer");
  };

  return (
    <div ref={boxRef} className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
          else if (e.key === "Enter" && results[active]) go(results[active]);
          else if (e.key === "Escape") { setOpen(false); inputRef.current?.blur(); }
        }}
        placeholder="Search companies or questions…"
        className="h-9 pr-12 pl-8"
        aria-label="Search companies or questions"
      />
      <kbd className="pointer-events-none absolute top-1/2 right-2 hidden -translate-y-1/2 rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground sm:block">
        Ctrl K
      </kbd>
      {open && q.trim() && (
        <div className="absolute top-full right-0 left-0 z-50 mt-1.5 max-h-[70vh] overflow-auto rounded-xl border bg-popover p-1.5 shadow-lg">
          {!index && <p className="p-3 text-sm text-muted-foreground">Loading index…</p>}
          {index && results.length === 0 && <p className="p-3 text-sm text-muted-foreground">No matches for “{q}”.</p>}
          {results.map((r, i) => (
            <button
              key={r.key}
              type="button"
              onMouseEnter={() => setActive(i)}
              onClick={() => go(r)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm",
                i === active && "bg-muted",
              )}
            >
              {r.kind === "company" ? (
                <>
                  <CompanyLogo name={r.name} domain={r.domain} logo={r.logo} size={22} />
                  <span className="flex-1 truncate font-medium">{r.name}</span>
                  <span className="text-xs text-muted-foreground">{r.total} questions</span>
                </>
              ) : (
                <>
                  <ExternalLink className="size-4 text-muted-foreground" />
                  <span className="flex-1 truncate">{r.title}</span>
                  <DifficultyBadge difficulty={r.difficulty} />
                </>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
