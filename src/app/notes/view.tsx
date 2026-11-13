"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Download, ExternalLink, NotebookPen, Pencil, Search, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { NoteDialog } from "@/components/questions/note-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { actions, useHydrated, useUserState, type UserState } from "@/lib/store";
import { useSiteIndex } from "@/lib/use-site-index";

export function NotesView() {
  const { notes } = useUserState();
  const hydrated = useHydrated();
  const index = useSiteIndex();
  const [q, setQ] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const byslug = useMemo(() => new Map(index?.questions.map((x) => [x.slug, x]) ?? []), [index]);
  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return Object.entries(notes)
      .map(([slug, note]) => ({ slug, note, question: byslug.get(slug) }))
      .filter(({ slug, note, question }) =>
        !term ||
        note.text.toLowerCase().includes(term) ||
        (question?.title ?? slug).toLowerCase().includes(term),
      )
      .sort((a, b) => b.note.updatedAt.localeCompare(a.note.updatedAt));
  }, [notes, byslug, q]);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(actions.exportState(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `companyleet-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (file: File) => {
    try {
      const data = JSON.parse(await file.text()) as Partial<UserState>;
      if (typeof data !== "object" || !data || !("solved" in data || "notes" in data || "bookmarks" in data))
        throw new Error("not a backup");
      actions.importState(data);
      toast.success("Backup restored");
    } catch {
      toast.error("That file is not a CompanyLeet backup");
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Notes" description="Your notes on each question. Back them up to keep them safe.">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download /> Export backup
          </Button>
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload /> Import
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void importData(f);
              e.target.value = "";
            }}
          />
        </div>
      </PageHeader>

      {hydrated && Object.keys(notes).length === 0 ? (
        <EmptyState
          icon={NotebookPen}
          title="No notes yet"
          description="Use the note icon next to any question to write down your approach."
        >
          <Button asChild variant="outline">
            <Link href="/questions">Browse questions</Link>
          </Button>
        </EmptyState>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search notes…" className="h-9 pl-8" />
          </div>
          {list.map(({ slug, note, question }) => {
            const title = question?.title ?? slug;
            return (
              <Card key={slug} className="gap-3 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={question?.link ?? `https://leetcode.com/problems/${slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium hover:text-brand"
                  >
                    {title} <ExternalLink className="size-3.5 opacity-60" />
                  </a>
                  {question && <DifficultyBadge difficulty={question.difficulty} />}
                  <span className="ml-auto text-xs text-muted-foreground">
                    Updated {new Date(note.updatedAt).toLocaleString()}
                  </span>
                </div>
                <p className="rounded-lg bg-muted/60 p-3 font-mono text-sm whitespace-pre-wrap">{note.text}</p>
                <div className="flex gap-1">
                  <NoteDialog
                    slug={slug}
                    title={title}
                    trigger={
                      <Button variant="ghost" size="sm">
                        <Pencil /> Edit
                      </Button>
                    }
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => {
                      actions.saveNote(slug, "");
                      toast("Note deleted");
                    }}
                  >
                    <Trash2 /> Delete
                  </Button>
                </div>
              </Card>
            );
          })}
          {list.length === 0 && q && <p className="py-8 text-center text-muted-foreground">No notes match “{q}”.</p>}
        </div>
      )}
    </div>
  );
}
