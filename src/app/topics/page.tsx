import type { Metadata } from "next";
import Link from "next/link";
import { DifficultyBar } from "@/components/difficulty-badge";
import { PageHeader } from "@/components/page-header";
import { getTopicStats } from "@/lib/data";

export const metadata: Metadata = { title: "Topics" };

export default function TopicsPage() {
  const topics = getTopicStats();
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Topics" description={`${topics.length} question categories. Pick one to see its questions.`} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {topics.map((t) => (
          <Link
            key={t.topic}
            href={`/questions?topic=${encodeURIComponent(t.topic)}`}
            className="group space-y-3 rounded-xl border bg-card p-4 transition-colors hover:border-brand/40"
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-medium group-hover:text-brand">{t.topic}</span>
              <span className="text-sm text-muted-foreground tabular-nums">{t.total}</span>
            </div>
            <DifficultyBar easy={t.easy} medium={t.medium} hard={t.hard} />
            <div className="flex gap-3 text-xs tabular-nums">
              <span className="text-easy">{t.easy} easy</span>
              <span className="text-medium">{t.medium} medium</span>
              <span className="text-hard">{t.hard} hard</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
