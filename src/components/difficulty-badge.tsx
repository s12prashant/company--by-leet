import { cn } from "@/lib/utils";
import type { Difficulty } from "@/lib/types";

const STYLES: Record<Difficulty, string> = {
  Easy: "text-easy bg-easy/10 ring-easy/25",
  Medium: "text-medium bg-medium/10 ring-medium/25",
  Hard: "text-hard bg-hard/10 ring-hard/25",
};

export function DifficultyBadge({ difficulty, className }: { difficulty: Difficulty; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        STYLES[difficulty],
        className,
      )}
    >
      {difficulty}
    </span>
  );
}

/** Thin stacked bar showing easy / medium / hard split */
export function DifficultyBar({
  easy,
  medium,
  hard,
  className,
}: {
  easy: number;
  medium: number;
  hard: number;
  className?: string;
}) {
  const total = easy + medium + hard || 1;
  return (
    <div className={cn("flex h-1.5 w-full gap-px overflow-hidden rounded-full bg-muted", className)}>
      <div className="bg-easy" style={{ width: `${(easy / total) * 100}%` }} />
      <div className="bg-medium" style={{ width: `${(medium / total) * 100}%` }} />
      <div className="bg-hard" style={{ width: `${(hard / total) * 100}%` }} />
    </div>
  );
}
