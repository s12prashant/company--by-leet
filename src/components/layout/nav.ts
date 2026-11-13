import { Bookmark, Building2, LayoutDashboard, ListChecks, NotebookPen, Tags } from "lucide-react";

export const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/questions", label: "All Questions", icon: ListChecks },
  { href: "/topics", label: "Topics", icon: Tags },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark, count: "bookmarks" as const },
  { href: "/notes", label: "Notes", icon: NotebookPen, count: "notes" as const },
];
