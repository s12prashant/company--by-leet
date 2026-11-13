import Link from "next/link";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl py-10">
      <EmptyState icon={SearchX} title="Page not found" description="That company or page doesn't exist.">
        <Button asChild variant="outline">
          <Link href="/companies">Browse companies</Link>
        </Button>
      </EmptyState>
    </div>
  );
}
