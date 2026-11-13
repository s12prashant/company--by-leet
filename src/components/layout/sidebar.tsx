"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CompanyLogo } from "@/components/company-logo";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUserState } from "@/lib/store";
import type { CompanySummary } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Brand } from "./brand";
import { NAV } from "./nav";

export function SidebarContent({
  topCompanies,
  onNavigate,
}: {
  topCompanies: CompanySummary[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const user = useUserState();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <Brand />
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <nav className="space-y-1 p-3">
          {NAV.map(({ href, label, icon: Icon, count }) => {
            const n = count ? Object.keys(user[count]).length : 0;
            return (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  isActive(href) && "bg-muted font-medium text-foreground",
                )}
              >
                <Icon className={cn("size-4", isActive(href) && "text-brand")} />
                <span className="flex-1">{label}</span>
                {n > 0 && (
                  <span className="rounded-full bg-brand/15 px-1.5 text-xs font-medium text-brand tabular-nums">
                    {n}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="px-6 pt-3 pb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Top companies
        </div>
        <div className="space-y-0.5 px-3 pb-4">
          {topCompanies.map((c) => (
            <Link
              key={c.slug}
              href={`/companies/${c.slug}`}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm hover:bg-muted",
                pathname === `/companies/${c.slug}` && "bg-muted font-medium",
              )}
            >
              <CompanyLogo name={c.name} domain={c.domain} logo={c.logo} size={20} />
              <span className="flex-1 truncate">{c.name}</span>
              <span className="text-xs text-muted-foreground tabular-nums">{c.total}</span>
            </Link>
          ))}
          <Link
            href="/companies"
            onClick={onNavigate}
            className="block px-3 py-1.5 text-sm text-brand hover:underline"
          >
            View all companies →
          </Link>
        </div>
      </ScrollArea>
    </div>
  );
}

export function Sidebar({ topCompanies }: { topCompanies: CompanySummary[] }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r bg-sidebar lg:block">
      <SidebarContent topCompanies={topCompanies} />
    </aside>
  );
}
