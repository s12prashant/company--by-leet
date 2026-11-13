"use client";

import Link from "next/link";
import { Bookmark } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { IndexQuestionTable } from "@/components/questions/index-question-table";
import { Button } from "@/components/ui/button";
import { useHydrated, useUserState } from "@/lib/store";

export function BookmarksView() {
  const { bookmarks } = useUserState();
  const hydrated = useHydrated();
  const n = Object.keys(bookmarks).length;
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Bookmarks" description={`${n} saved question${n === 1 ? "" : "s"} to revisit.`} />
      {hydrated && (
        <IndexQuestionTable
          only={bookmarks}
          empty={
            <EmptyState icon={Bookmark} title="No bookmarks yet" description="Tap the bookmark icon on any question to save it here.">
              <Button asChild variant="outline">
                <Link href="/questions">Browse questions</Link>
              </Button>
            </EmptyState>
          }
        />
      )}
    </div>
  );
}
