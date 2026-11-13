"use client";

import { Flame } from "lucide-react";
import { useMemo } from "react";
import { currentStreak, dayKey } from "@/lib/dates";
import { useHydrated, useUserState } from "@/lib/store";
import { cn } from "@/lib/utils";

/** Days with at least one solved question (includes the daily challenge). */
export function useActivityDays() {
  const { solved, daily } = useUserState();
  return useMemo(() => {
    const days = new Set<string>(Object.keys(daily));
    for (const iso of Object.values(solved)) days.add(dayKey(new Date(iso)));
    return days;
  }, [solved, daily]);
}

export function StreakBadge() {
  const hydrated = useHydrated();
  const days = useActivityDays();
  const streak = hydrated ? currentStreak(days) : 0;
  const activeToday = hydrated && days.has(dayKey());
  return (
    <div
      title={activeToday ? "You solved something today" : "Solve a question today to keep your streak"}
      className={cn(
        "flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-sm font-medium tabular-nums",
        activeToday ? "border-brand/40 bg-brand/10 text-brand" : "text-muted-foreground",
      )}
    >
      <Flame className={cn("size-4", activeToday && "fill-brand/30")} />
      {streak}
      <span className="sr-only">day streak</span>
    </div>
  );
}
