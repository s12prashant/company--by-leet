"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { currentStreak, dayKey, longestStreak } from "@/lib/dates";
import { useHydrated, useUserState } from "@/lib/store";
import { useSiteIndex } from "@/lib/use-site-index";
import type { DifficultyCounts } from "@/lib/types";
import { useActivityDays } from "@/components/layout/streak-badge";

export function ProgressCard({ totals }: { totals: DifficultyCounts }) {
  const index = useSiteIndex();
  const hydrated = useHydrated();
  const { solved, bookmarks, notes } = useUserState();
  const days = useActivityDays();

  const done = useMemo(() => {
    const c = { total: 0, easy: 0, medium: 0, hard: 0 };
    if (!index) return { ...c, total: Object.keys(solved).length };
    const diff = new Map(index.questions.map((q) => [q.slug, q.difficulty]));
    for (const slug of Object.keys(solved)) {
      const d = diff.get(slug);
      if (!d) continue;
      c.total++;
      if (d === "Easy") c.easy++;
      else if (d === "Medium") c.medium++;
      else c.hard++;
    }
    return c;
  }, [index, solved]);

  const pct = totals.total ? (done.total / totals.total) * 100 : 0;
  const R = 52;
  const C = 2 * Math.PI * R;
  const today = hydrated ? Object.values(solved).filter((iso) => dayKey(new Date(iso)) === dayKey()).length : 0;

  return (
    <Card>
      <CardHeader>
        <CardDescription>Your progress</CardDescription>
        <CardTitle>Solved questions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center gap-6">
          <div className="relative size-32 shrink-0">
            <svg viewBox="0 0 120 120" className="size-full -rotate-90">
              <circle cx="60" cy="60" r={R} fill="none" strokeWidth="9" className="stroke-muted" />
              <circle
                cx="60" cy="60" r={R} fill="none" strokeWidth="9" strokeLinecap="round"
                className="stroke-brand transition-[stroke-dashoffset] duration-700"
                strokeDasharray={C}
                strokeDashoffset={C - (C * Math.min(pct, 100)) / 100}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-semibold tabular-nums">{done.total}</span>
              <span className="text-xs text-muted-foreground tabular-nums">/ {totals.total.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex-1 space-y-3">
            {(
              [
                ["Easy", done.easy, totals.easy, "bg-easy", "text-easy"],
                ["Medium", done.medium, totals.medium, "bg-medium", "text-medium"],
                ["Hard", done.hard, totals.hard, "bg-hard", "text-hard"],
              ] as const
            ).map(([label, n, t, bar, text]) => (
              <div key={label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className={text}>{label}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {n} / {t}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className={`h-full rounded-full ${bar}`} style={{ width: `${t ? (n / t) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 border-t pt-4 text-center">
          <Stat value={hydrated ? currentStreak(days) : 0} label="Streak" />
          <Stat value={longestStreak(days)} label="Longest" />
          <Stat value={today} label="Today" />
          <Stat value={Object.keys(bookmarks).length + Object.keys(notes).length} label="Saved" />
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="text-lg font-semibold tabular-nums">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
