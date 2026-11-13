"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CalendarCheck2, CheckCircle2, ExternalLink, Flame } from "lucide-react";
import { CompanyLogo } from "@/components/company-logo";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { currentStreak, dayKey, hash, longestStreak } from "@/lib/dates";
import { actions, useHydrated, useUserState } from "@/lib/store";
import { useSiteIndex } from "@/lib/use-site-index";
import { toast } from "sonner";

/** Picks the same question for everyone on a given day from popular (5+ companies) questions. */
export function DailyQuestion() {
  const index = useSiteIndex();
  const hydrated = useHydrated();
  const { daily } = useUserState();
  const today = hydrated ? dayKey() : null;

  const question = useMemo(() => {
    if (!index || !today) return null;
    const pool = index.questions.filter((q) => q.companies.length >= 5).sort((a, b) => a.slug.localeCompare(b.slug));
    return pool[hash(today) % pool.length] ?? null;
  }, [index, today]);

  const companyMap = useMemo(() => new Map(index?.companies.map((c) => [c.slug, c]) ?? []), [index]);
  const days = useMemo(() => new Set(Object.keys(daily)), [daily]);
  const streak = hydrated ? currentStreak(days) : 0;
  const best = longestStreak(days);
  const done = today ? Boolean(daily[today]) : false;

  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-16 -right-16 size-40 rounded-full bg-brand/15 blur-2xl" />
      <CardHeader>
        <CardDescription className="flex items-center gap-1.5">
          <CalendarCheck2 className="size-4 text-brand" /> Daily question
          {today && <span className="ml-auto tabular-nums">{today}</span>}
        </CardDescription>
        <CardTitle className="text-lg leading-snug">
          {question ? question.title : <Skeleton className="h-6 w-3/4" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {question ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <DifficultyBadge difficulty={question.difficulty} />
              <span className="text-xs text-muted-foreground">Asked by {question.companies.length} companies</span>
            </div>
            <div className="flex -space-x-1.5">
              {question.companies.slice(0, 8).map((s) => {
                const c = companyMap.get(s);
                return c ? (
                  <Link key={s} href={`/companies/${s}`} title={c.name} className="rounded-md ring-2 ring-card">
                    <CompanyLogo name={c.name} domain={c.domain} logo={c.logo} size={24} />
                  </Link>
                ) : null;
              })}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <a href={question.link} target="_blank" rel="noreferrer">
                  Solve on LeetCode <ExternalLink />
                </a>
              </Button>
              {done ? (
                <Button size="sm" variant="secondary" disabled>
                  <CheckCircle2 className="text-easy" /> Completed today
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="bg-brand text-brand-foreground hover:bg-brand/90"
                  onClick={() => {
                    if (!today) return;
                    actions.completeDaily(today, question.slug);
                    toast.success(`Daily question done! Streak: ${streak + 1} day${streak ? "s" : ""} 🔥`);
                  }}
                >
                  <CheckCircle2 /> Mark complete
                </Button>
              )}
            </div>
          </>
        ) : (
          <Skeleton className="h-24 w-full" />
        )}
        <div className="grid grid-cols-2 gap-2 border-t pt-4">
          <div>
            <p className="flex items-center gap-1 text-2xl font-semibold tabular-nums">
              <Flame className="size-5 text-brand" /> {streak}
            </p>
            <p className="text-xs text-muted-foreground">Daily streak</p>
          </div>
          <div>
            <p className="text-2xl font-semibold tabular-nums">{best}</p>
            <p className="text-xs text-muted-foreground">Best streak</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
