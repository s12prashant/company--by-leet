"use client";

import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSiteIndex } from "@/lib/use-site-index";
import type { IndexQuestion } from "@/lib/types";
import { QuestionTable } from "./question-table";

/** Question table backed by the global index; optionally limited to a subset of slugs. */
export function IndexQuestionTable({
  only,
  emptyMessage,
  empty,
}: {
  /** restrict to these slugs (bookmarks, etc.) */
  only?: Record<string, unknown>;
  emptyMessage?: string;
  /** rendered instead of the table when `only` is empty */
  empty?: React.ReactNode;
}) {
  const index = useSiteIndex();
  const companies = useMemo(
    () => (index ? Object.fromEntries(index.companies.map((c) => [c.slug, c])) : undefined),
    [index],
  );
  const questions = useMemo<IndexQuestion[]>(() => {
    if (!index) return [];
    return only ? index.questions.filter((q) => only[q.slug]) : index.questions;
  }, [index, only]);

  if (only && Object.keys(only).length === 0 && empty) return <>{empty}</>;
  if (!index) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-9 w-full" />
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }
  return (
    <QuestionTable questions={questions} companies={companies} defaultSort="companies" emptyMessage={emptyMessage} />
  );
}
