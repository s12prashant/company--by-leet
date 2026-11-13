import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CircleDot, Clock, Layers, ListChecks, Signal } from "lucide-react";
import { CompanyLogo } from "@/components/company-logo";
import { CompanyProgress } from "@/components/company-progress";
import { QuestionTable } from "@/components/questions/question-table";
import { StatCard } from "@/components/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { countDifficulties, getCompanies, getCompany } from "@/lib/data";

export function generateStaticParams() {
  return getCompanies().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/companies/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const company = getCompany(slug);
  return { title: company ? `${company.name} questions` : "Company not found" };
}

export default function CompanyPage({ params }: PageProps<"/companies/[slug]">) {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Link href="/companies" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All companies
      </Link>
      <Suspense fallback={<CompanySkeleton />}>
        <CompanyDetails params={params} />
      </Suspense>
    </div>
  );
}

function CompanySkeleton() {
  return (
    <>
      <Skeleton className="h-28 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
      <Skeleton className="h-96 w-full rounded-xl" />
    </>
  );
}

async function CompanyDetails({ params }: { params: PageProps<"/companies/[slug]">["params"] }) {
  const { slug } = await params;
  const company = getCompany(slug);
  if (!company) notFound();
  const counts = countDifficulties(company.questions);
  const recent = company.questions.filter((q) => q.periods.includes("thirty-days")).length;

  return (
    <>
      <div className="flex flex-col gap-5 rounded-2xl border bg-card p-5 md:flex-row md:items-center">
        <CompanyLogo name={company.name} domain={company.domain} logo={company.logo} size={64} className="rounded-xl" />
        <div className="flex-1 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{company.name}</h1>
          <p className="text-sm text-muted-foreground">
            {counts.total} LeetCode questions asked in {company.name} interviews · {recent} in the last 30 days
          </p>
        </div>
        <CompanyProgress slugs={company.questions.map((q) => q.slug)} />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Total" value={counts.total} icon={ListChecks} />
        <StatCard label="Easy" value={counts.easy} icon={CircleDot} tone="easy" />
        <StatCard label="Medium" value={counts.medium} icon={Signal} tone="medium" />
        <StatCard label="Hard" value={counts.hard} icon={Layers} tone="hard" />
        <StatCard label="Last 30 days" value={recent} icon={Clock} tone="muted" />
      </div>

      <QuestionTable questions={company.questions} showPeriods />
    </>
  );
}
