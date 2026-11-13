"use client";

import { useMemo } from "react";
import { addDays, dayKey } from "@/lib/dates";
import { useHydrated, useUserState } from "@/lib/store";
import { cn } from "@/lib/utils";

const LEVELS = ["bg-heat-0", "bg-heat-1", "bg-heat-2", "bg-heat-3", "bg-heat-4"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKS = 53;

function level(n: number) {
  if (n <= 0) return 0;
  if (n === 1) return 1;
  if (n <= 3) return 2;
  if (n <= 6) return 3;
  return 4;
}

/** GitHub-style activity calendar of solved questions over the last year. */
export function Heatmap() {
  const hydrated = useHydrated();
  const { solved, daily } = useUserState();

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const iso of Object.values(solved)) {
      const k = dayKey(new Date(iso));
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    for (const k of Object.keys(daily)) if (!m.has(k)) m.set(k, 1);
    return m;
  }, [solved, daily]);

  const { weeks, monthLabels, total, activeDays } = useMemo(() => {
    // only build the calendar in the browser so "today" is the visitor's local date
    if (!hydrated) return { weeks: [] as { key: string; n: number; future: boolean }[][], monthLabels: [], total: 0, activeDays: 0 };
    const today = new Date();
    const start = addDays(today, -(WEEKS - 1) * 7 - today.getDay());
    const weeks: { key: string; n: number; future: boolean }[][] = [];
    const monthLabels: { col: number; label: string }[] = [];
    let total = 0;
    let activeDays = 0;
    for (let w = 0; w < WEEKS; w++) {
      const col: { key: string; n: number; future: boolean }[] = [];
      for (let d = 0; d < 7; d++) {
        const date = addDays(start, w * 7 + d);
        const key = dayKey(date);
        const n = counts.get(key) ?? 0;
        const future = date > today;
        if (!future) {
          total += n;
          if (n) activeDays++;
        }
        col.push({ key, n, future });
        if (date.getDate() === 1 || (w === 0 && d === 0)) monthLabels.push({ col: w, label: MONTHS[date.getMonth()] });
      }
      weeks.push(col);
    }
    return { weeks, monthLabels: monthLabels.filter((m, i, a) => i === 0 || m.col - a[i - 1].col > 2), total, activeDays };
  }, [counts, hydrated]);

  const fmt = (key: string) =>
    new Date(`${key}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
        <p>
          <span className="font-semibold tabular-nums">{total}</span>{" "}
          <span className="text-muted-foreground">questions solved in the last year</span>
        </p>
        <p className="text-muted-foreground">
          Active days: <span className="font-medium text-foreground tabular-nums">{activeDays}</span>
        </p>
      </div>
      <div className="overflow-x-auto pb-1">
        <div className="inline-flex flex-col gap-1">
          <div className="relative ml-7 h-4 text-[10px] text-muted-foreground">
            {monthLabels.map((m) => (
              <span key={`${m.col}-${m.label}`} className="absolute" style={{ left: m.col * 14 }}>
                {m.label}
              </span>
            ))}
          </div>
          <div className="flex gap-[3px]">
            <div className="mr-1 grid w-6 grid-rows-7 gap-[3px] text-[10px] leading-[11px] text-muted-foreground">
              <span />
              <span>Mon</span>
              <span />
              <span>Wed</span>
              <span />
              <span>Fri</span>
              <span />
            </div>
            {hydrated
              ? weeks.map((col, w) => (
                  <div key={w} className="grid grid-rows-7 gap-[3px]">
                    {col.map((c) => (
                      <div
                        key={c.key}
                        title={c.future ? undefined : `${c.n || "No"} question${c.n === 1 ? "" : "s"} on ${fmt(c.key)}`}
                        className={cn("size-[11px] rounded-[3px]", c.future ? "bg-transparent" : LEVELS[level(c.n)])}
                      />
                    ))}
                  </div>
                ))
              : Array.from({ length: WEEKS }, (_, w) => (
                  <div key={w} className="grid grid-rows-7 gap-[3px]">
                    {Array.from({ length: 7 }, (_, d) => (
                      <div key={d} className="size-[11px] rounded-[3px] bg-heat-0" />
                    ))}
                  </div>
                ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-1.5 text-[11px] text-muted-foreground">
        Less
        {LEVELS.map((l) => (
          <span key={l} className={cn("size-[11px] rounded-[3px]", l)} />
        ))}
        More
      </div>
    </div>
  );
}
