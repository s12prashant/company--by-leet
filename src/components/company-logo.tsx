"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const PALETTE = [
  "bg-orange-500", "bg-sky-500", "bg-emerald-500", "bg-violet-500",
  "bg-rose-500", "bg-amber-500", "bg-teal-500", "bg-indigo-500",
];

export function logoUrl(domain: string, logo?: string) {
  return logo ?? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
}

/** Company logo from its domain favicon, falling back to a coloured initial. */
export function CompanyLogo({
  name,
  domain,
  logo,
  size = 32,
  className,
}: {
  name: string;
  domain: string;
  logo?: string;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  // Fixed pixel size; percentage padding would resolve against the parent's width.
  const style = { width: size, height: size, minWidth: size };
  const box = "shrink-0 overflow-hidden rounded-md ring-1 ring-border";

  if (failed) {
    const color = PALETTE[name.charCodeAt(0) % PALETTE.length];
    return (
      <span
        style={{ ...style, fontSize: size * 0.45 }}
        className={cn(box, color, "flex items-center justify-center font-semibold text-white", className)}
        aria-hidden
      >
        {name.charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    <span
      style={{ ...style, padding: Math.max(2, Math.round(size * 0.12)) }}
      className={cn(box, "flex items-center justify-center bg-white", className)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoUrl(domain, logo)}
        alt={`${name} logo`}
        loading="lazy"
        className="size-full object-contain"
        onError={() => setFailed(true)}
      />
    </span>
  );
}
