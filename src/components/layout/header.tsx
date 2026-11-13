"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { CompanySummary } from "@/lib/types";
import { Brand } from "./brand";
import { GlobalSearch } from "./global-search";
import { SidebarContent } from "./sidebar";
import { StreakBadge } from "./streak-badge";

export function Header({ topCompanies }: { topCompanies: CompanySummary[] }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70 lg:px-6">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent topCompanies={topCompanies} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="hidden sm:block lg:hidden">
        <Brand />
      </div>
      <GlobalSearch />
      <div className="ml-auto flex items-center gap-1.5">
        <StreakBadge />
        <ThemeToggle />
      </div>
    </header>
  );
}
