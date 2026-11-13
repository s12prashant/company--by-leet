"use client";

import { useState } from "react";
import { NotebookPen } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { actions, useUserState } from "@/lib/store";
import { cn } from "@/lib/utils";

export function NoteDialog({ slug, title, trigger }: { slug: string; title: string; trigger?: React.ReactNode }) {
  const { notes } = useUserState();
  const existing = notes[slug]?.text ?? "";
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(existing);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setText(existing);
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={existing ? "Edit note" : "Add note"}
            title={existing ? "Edit note" : "Add note"}
          >
            <NotebookPen className={cn(existing ? "text-brand" : "text-muted-foreground")} />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Notes: {title}</DialogTitle>
          <DialogDescription>Approach, edge cases, complexity. Saved in this browser.</DialogDescription>
        </DialogHeader>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={9}
          autoFocus
          placeholder={"e.g. Two pointers from both ends.\nTime O(n), space O(1).\nWatch out for duplicates."}
          className="font-mono text-sm"
        />
        <DialogFooter className="gap-2 sm:justify-between">
          {existing ? (
            <Button
              variant="destructive"
              onClick={() => {
                actions.saveNote(slug, "");
                setOpen(false);
                toast("Note deleted");
              }}
            >
              Delete note
            </Button>
          ) : (
            <span />
          )}
          <Button
            onClick={() => {
              actions.saveNote(slug, text);
              setOpen(false);
              toast.success(text.trim() ? "Note saved" : "Note removed");
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
