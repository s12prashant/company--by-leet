"use client";

import { useUserState } from "@/lib/store";

export function CompanyProgress({ slugs }: { slugs: string[] }) {
  const { solved } = useUserState();
  const done = slugs.filter((s) => solved[s]).length;
  const pct = slugs.length ? Math.round((done / slugs.length) * 100) : 0;
  return (
    <div className="w-full space-y-1.5 md:w-56">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Your progress</span>
        <span className="font-medium tabular-nums">
          {done}/{slugs.length} · {pct}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
