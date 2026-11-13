export type Difficulty = "Easy" | "Medium" | "Hard";

export type Period = "thirty-days" | "three-months" | "six-months" | "more-than-six-months";

export const PERIODS: { value: Period; label: string }[] = [
  { value: "thirty-days", label: "30 days" },
  { value: "three-months", label: "3 months" },
  { value: "six-months", label: "6 months" },
  { value: "more-than-six-months", label: "6+ months" },
];

export const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

/** One question as stored inside data/companies/<slug>.json */
export interface CompanyQuestion {
  title: string;
  slug: string;
  difficulty: Difficulty;
  link: string;
  /** how often the company asks it, 0-100 */
  frequency: number;
  /** LeetCode acceptance rate in percent */
  acceptance: number;
  topics: string[];
  /** time windows in which the company asked it */
  periods: Period[];
}

/** Shape of data/companies/<slug>.json */
export interface Company {
  name: string;
  slug: string;
  /** website domain, used to fetch the logo */
  domain: string;
  /** optional explicit logo URL, overrides the domain favicon */
  logo?: string;
  questions: CompanyQuestion[];
}

export interface DifficultyCounts {
  total: number;
  easy: number;
  medium: number;
  hard: number;
}

export interface CompanySummary extends DifficultyCounts {
  name: string;
  slug: string;
  domain: string;
  logo?: string;
  /** questions asked in the last 30 days */
  recent: number;
}

/** A unique question across all companies */
export interface IndexQuestion {
  title: string;
  slug: string;
  difficulty: Difficulty;
  link: string;
  acceptance: number;
  topics: string[];
  /** company slugs that ask this question */
  companies: string[];
  /** highest frequency across companies */
  frequency: number;
}

export interface SiteIndex {
  companies: CompanySummary[];
  questions: IndexQuestion[];
}

/** A row in the question table (company question or global question) */
export interface TableQuestion {
  title: string;
  slug: string;
  difficulty: Difficulty;
  link: string;
  acceptance: number;
  frequency: number;
  topics: string[];
  periods?: Period[];
  companies?: string[];
}
