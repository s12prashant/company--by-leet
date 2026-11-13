import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { IndexQuestionTable } from "@/components/questions/index-question-table";
import { getGlobalStats } from "@/lib/data";

export const metadata: Metadata = { title: "All questions" };

export default function QuestionsPage() {
  const stats = getGlobalStats();
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="All questions"
        description={`${stats.total.toLocaleString()} unique questions from ${stats.companies} companies, most widely asked first.`}
      />
      <IndexQuestionTable />
    </div>
  );
}
