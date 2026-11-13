"use client";

import { useSyncExternalStore } from "react";

/**
 * Personal progress lives in the browser (localStorage), so no account is needed.
 * One versioned key keeps everything easy to export/import.
 */
export interface Note {
  text: string;
  updatedAt: string;
}

export interface UserState {
  /** question slug -> ISO time it was marked solved */
  solved: Record<string, string>;
  /** question slug -> ISO time it was bookmarked */
  bookmarks: Record<string, string>;
  /** question slug -> note */
  notes: Record<string, Note>;
  /** local day key (YYYY-MM-DD) -> slug of the daily question solved that day */
  daily: Record<string, string>;
}

const KEY = "company-by-leet:v1";
const EMPTY: UserState = { solved: {}, bookmarks: {}, notes: {}, daily: {} };

let state: UserState = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    state = EMPTY;
  }
}

function persist() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked: keep in memory */
  }
}

function setState(updater: (s: UserState) => UserState) {
  load();
  state = updater(state);
  persist();
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    loaded = false;
    load();
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  load();
  return state;
}

const getServerSnapshot = () => EMPTY;

export function useUserState(): UserState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** true once running in the browser with localStorage loaded */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

const without = <T,>(obj: Record<string, T>, key: string) => {
  const next = { ...obj };
  delete next[key];
  return next;
};

export const actions = {
  toggleSolved(slug: string) {
    setState((s) =>
      s.solved[slug]
        ? { ...s, solved: without(s.solved, slug) }
        : { ...s, solved: { ...s.solved, [slug]: new Date().toISOString() } },
    );
  },
  toggleBookmark(slug: string) {
    setState((s) =>
      s.bookmarks[slug]
        ? { ...s, bookmarks: without(s.bookmarks, slug) }
        : { ...s, bookmarks: { ...s.bookmarks, [slug]: new Date().toISOString() } },
    );
  },
  saveNote(slug: string, text: string) {
    setState((s) =>
      text.trim()
        ? { ...s, notes: { ...s.notes, [slug]: { text, updatedAt: new Date().toISOString() } } }
        : { ...s, notes: without(s.notes, slug) },
    );
  },
  completeDaily(day: string, slug: string) {
    setState((s) => ({
      ...s,
      daily: { ...s.daily, [day]: slug },
      solved: s.solved[slug] ? s.solved : { ...s.solved, [slug]: new Date().toISOString() },
    }));
  },
  importState(data: Partial<UserState>) {
    setState(() => ({
      solved: data.solved ?? {},
      bookmarks: data.bookmarks ?? {},
      notes: data.notes ?? {},
      daily: data.daily ?? {},
    }));
  },
  exportState(): UserState {
    load();
    return state;
  },
};
