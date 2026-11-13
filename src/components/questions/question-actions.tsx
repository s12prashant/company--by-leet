"use client";

import { Bookmark, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { actions, useUserState } from "@/lib/store";
import { cn } from "@/lib/utils";

export function SolvedToggle({ slug, title }: { slug: string; title: string }) {
  const { solved } = useUserState();
  const done = Boolean(solved[slug]);
  return (
    <button
      type="button"
      onClick={() => actions.toggleSolved(slug)}
      aria-pressed={done}
      aria-label={done ? `Mark ${title} as unsolved` : `Mark ${title} as solved`}
      title={done ? "Solved (click to undo)" : "Mark as solved"}
      className="flex size-7 items-center justify-center rounded-md hover:bg-muted"
    >
      {done ? <CheckCircle2 className="size-5 text-easy" /> : <Circle className="size-5 text-muted-foreground/60" />}
    </button>
  );
}

export function BookmarkToggle({ slug, title }: { slug: string; title: string }) {
  const { bookmarks } = useUserState();
  const on = Boolean(bookmarks[slug]);
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={() => actions.toggleBookmark(slug)}
      aria-pressed={on}
      aria-label={on ? `Remove bookmark for ${title}` : `Bookmark ${title}`}
      title={on ? "Remove bookmark" : "Bookmark"}
    >
      <Bookmark className={cn(on ? "fill-brand text-brand" : "text-muted-foreground")} />
    </Button>
  );
}
