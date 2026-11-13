import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "brand",
  hint,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: "brand" | "easy" | "medium" | "hard" | "muted";
  hint?: string;
}) {
  const tones = {
    brand: "bg-brand/12 text-brand",
    easy: "bg-easy/12 text-easy",
    medium: "bg-medium/12 text-medium",
    hard: "bg-hard/12 text-hard",
    muted: "bg-muted text-muted-foreground",
  };
  return (
    <Card className="flex-row items-center gap-3 px-4 py-4">
      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", tones[tone])}>
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-2xl leading-tight font-semibold tabular-nums">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {label}
          {hint && <span className="ml-1 opacity-70">{hint}</span>}
        </p>
      </div>
    </Card>
  );
}
