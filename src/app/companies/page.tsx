import type { Metadata } from "next";
import { CompaniesGrid } from "@/components/companies-grid";
import { PageHeader } from "@/components/page-header";
import { getCompanySummaries } from "@/lib/data";

export const metadata: Metadata = { title: "Companies" };

export default function CompaniesPage() {
  const companies = getCompanySummaries();
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Companies" description="Pick a company to see the LeetCode questions it asks in interviews." />
      <CompaniesGrid companies={companies} />
    </div>
  );
}
