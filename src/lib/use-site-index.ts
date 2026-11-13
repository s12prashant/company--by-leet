"use client";

import { useEffect, useState } from "react";
import type { SiteIndex } from "./types";

let cache: SiteIndex | null = null;
let pending: Promise<SiteIndex> | null = null;

function fetchIndex(): Promise<SiteIndex> {
  pending ??= fetch("/api/index")
    .then((r) => r.json() as Promise<SiteIndex>)
    .then((data) => (cache = data))
    .catch((err) => {
      pending = null;
      throw err;
    });
  return pending;
}

/** Loads the global question/company index once and shares it between components. */
export function useSiteIndex(): SiteIndex | null {
  const [data, setData] = useState<SiteIndex | null>(cache);
  useEffect(() => {
    if (cache) return;
    let alive = true;
    fetchIndex().then((d) => alive && setData(d)).catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return data;
}
