import "server-only";
import fs from "node:fs";
import path from "node:path";
import type {
  Company,
  CompanySummary,
  DifficultyCounts,
  IndexQuestion,
  SiteIndex,
  CompanyQuestion,
} from "./types";

/**
 * All question data lives in data/companies/*.json (one file per company).
 * Add a company by dropping a new JSON file there; delete one by removing its file.
 * Files are read synchronously, so Next.js prerenders every page at build time.
 */
const DATA_DIR = path.join(process.cwd(), "data", "companies");

let companiesCache: Company[] | null = null;

export function getCompanies(): Company[] {
  if (companiesCache) return companiesCache;
  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
  companiesCache = files
    .map((file) => {
      const raw = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8")) as Partial<Company>;
      const slug = raw.slug ?? file.replace(/\.json$/, "");
      return {
        name: raw.name ?? slug,
        slug,
        domain: raw.domain ?? `${slug}.com`,
        logo: raw.logo,
        questions: (raw.questions ?? []).filter((q): q is CompanyQuestion => Boolean(q?.slug && q?.title)),
      } satisfies Company;
    })
    .filter((c) => c.questions.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
  return companiesCache;
}

export function getCompany(slug: string): Company | undefined {
  return getCompanies().find((c) => c.slug === slug);
}

export function countDifficulties(qs: { difficulty: string }[]): DifficultyCounts {
  const c = { total: qs.length, easy: 0, medium: 0, hard: 0 };
  for (const q of qs) {
    if (q.difficulty === "Easy") c.easy++;
    else if (q.difficulty === "Medium") c.medium++;
    else if (q.difficulty === "Hard") c.hard++;
  }
  return c;
}

export function getCompanySummaries(): CompanySummary[] {
  return getCompanies()
    .map((c) => ({
      name: c.name,
      slug: c.slug,
      domain: c.domain,
      ...(c.logo ? { logo: c.logo } : {}),
      ...countDifficulties(c.questions),
      recent: c.questions.filter((q) => q.periods.includes("thirty-days")).length,
    }))
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
}

let indexCache: IndexQuestion[] | null = null;

/** Unique questions across every company, most-asked first. */
export function getQuestionIndex(): IndexQuestion[] {
  if (indexCache) return indexCache;
  const map = new Map<string, IndexQuestion>();
  for (const company of getCompanies()) {
    for (const q of company.questions) {
      const existing = map.get(q.slug);
      if (existing) {
        existing.companies.push(company.slug);
        existing.frequency = Math.max(existing.frequency, q.frequency);
      } else {
        map.set(q.slug, {
          title: q.title,
          slug: q.slug,
          difficulty: q.difficulty,
          link: q.link,
          acceptance: q.acceptance,
          topics: q.topics,
          companies: [company.slug],
          frequency: q.frequency,
        });
      }
    }
  }
  indexCache = [...map.values()].sort(
    (a, b) => b.companies.length - a.companies.length || a.title.localeCompare(b.title),
  );
  return indexCache;
}

export function getSiteIndex(): SiteIndex {
  return { companies: getCompanySummaries(), questions: getQuestionIndex() };
}

export interface TopicStat {
  topic: string;
  total: number;
  easy: number;
  medium: number;
  hard: number;
}

export function getTopicStats(): TopicStat[] {
  const map = new Map<string, TopicStat>();
  for (const q of getQuestionIndex()) {
    for (const t of q.topics) {
      const s = map.get(t) ?? { topic: t, total: 0, easy: 0, medium: 0, hard: 0 };
      s.total++;
      if (q.difficulty === "Easy") s.easy++;
      else if (q.difficulty === "Medium") s.medium++;
      else s.hard++;
      map.set(t, s);
    }
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}

export function getGlobalStats() {
  const index = getQuestionIndex();
  return {
    ...countDifficulties(index),
    companies: getCompanies().length,
    topics: getTopicStats().length,
  };
}
