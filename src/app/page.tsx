import Link from "next/link";
import { Building2, CircleDot, Layers, ListChecks, Signal, Tags } from "lucide-react";
import { TopCompanies } from "@/components/companies-grid";
import { DailyQuestion } from "@/components/dashboard/daily-question";
import { Heatmap } from "@/components/dashboard/heatmap";
import { ProgressCard } from "@/components/dashboard/progress-card";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCompanySummaries, getGlobalStats, getTopicStats } from "@/lib/data";

export default function DashboardPage() {
  const stats = getGlobalStats();
  const topics = getTopicStats().slice(0, 10);
  const companies = getCompanySummaries().slice(0, 9);
  const maxTopic = topics[0]?.total ?? 1;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Company-wise LeetCode interview questions. Track what you solve, keep a streak, take notes.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total questions" value={stats.total} icon={ListChecks} />
        <StatCard label="Easy" value={stats.easy} icon={CircleDot} tone="easy" />
        <StatCard label="Medium" value={stats.medium} icon={Signal} tone="medium" />
        <StatCard label="Hard" value={stats.hard} icon={Layers} tone="hard" />
        <StatCard label="Companies" value={stats.companies} icon={Building2} tone="muted" />
        <StatCard label="Topics" value={stats.topics} icon={Tags} tone="muted" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card>
            <CardHeader>
              <CardDescription>Activity</CardDescription>
              <CardTitle>Solving heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <Heatmap />
            </CardContent>
          </Card>
          <ProgressCard totals={stats} />
        </div>
        <div className="space-y-6">
          <DailyQuestion />
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardDescription>Question categories</CardDescription>
                <CardTitle>Top topics</CardTitle>
              </div>
              <Link href="/topics" className="text-sm text-brand hover:underline">
                All {stats.topics} →
              </Link>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {topics.map((t) => (
                <Link key={t.topic} href={`/questions?topic=${encodeURIComponent(t.topic)}`} className="group block space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="group-hover:text-brand">{t.topic}</span>
                    <span className="text-muted-foreground tabular-nums">{t.total}</span>
                  </div>
                  <div className="flex h-1.5 overflow-hidden rounded-full bg-muted" style={{ width: `${(t.total / maxTopic) * 100}%` }}>
                    <div className="bg-easy" style={{ flex: t.easy }} />
                    <div className="bg-medium" style={{ flex: t.medium }} />
                    <div className="bg-hard" style={{ flex: t.hard }} />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold">Top companies</h2>
            <p className="text-sm text-muted-foreground">Ranked by number of questions asked</p>
          </div>
          <Link href="/companies" className="text-sm text-brand hover:underline">
            View all {stats.companies} →
          </Link>
        </div>
        <TopCompanies companies={companies} />
      </section>
    </div>
  );
}
