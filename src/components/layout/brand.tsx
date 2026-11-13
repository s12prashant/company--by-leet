import Link from "next/link";
import { Code2 } from "lucide-react";

export function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="flex size-8 items-center justify-center rounded-lg bg-brand text-brand-foreground">
        <Code2 className="size-4.5" />
      </span>
      <span>
        Company<span className="text-brand">Leet</span>
      </span>
    </Link>
  );
}
