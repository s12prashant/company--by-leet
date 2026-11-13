#!/usr/bin/env node
/**
 * Converts the CSV dump from https://github.com/liquidslr/leetcode-company-wise-problems
 * into one JSON file per company in data/companies/<slug>.json.
 *
 * Usage:
 *   node scripts/import-csv.mjs [path-to-cloned-repo]
 *   (default path: ../leetcode-company-wise-problems)
 *
 * Re-running is safe: an existing company file keeps its hand-edited
 * "name", "domain" and "logo" fields; only "questions" is regenerated.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.resolve(process.argv[2] ?? path.join(ROOT, "..", "leetcode-company-wise-problems"));
const OUT = path.join(ROOT, "data", "companies");

/** CSV file name -> period key stored in JSON */
const PERIOD_FILES = {
  "1. Thirty Days.csv": "thirty-days",
  "2. Three Months.csv": "three-months",
  "3. Six Months.csv": "six-months",
  "4. More Than Six Months.csv": "more-than-six-months",
};
const ALL_FILE = "5. All.csv";

/** Company name -> website domain (used for logos). Anything missing falls back to "<name>.com". */
const DOMAINS = {
  "Airbus SE": "airbus.com", Airtel: "airtel.in", "Akuna Capital": "akunacapital.com",
  "Analytics quotient": "analytics-quotient.com", "Apollo.io": "apollo.io",
  "AQR Capital Management": "aqr.com", "Arista Networks": "arista.com", Aurora: "aurora.tech",
  Avito: "avito.ru", "Bentley Systems": "bentley.com", "BILL Holdings": "bill.com",
  Blizzard: "blizzard.com", Block: "block.xyz", "BNY Mellon": "bny.com", Bolt: "bolt.eu",
  "Booking.com": "booking.com", "Bridgewater Associates": "bridgewater.com", Citigroup: "citi.com",
  CRED: "cred.club", Cruise: "getcruise.com", CTC: "chicagotrading.com", CureFit: "cult.fit",
  "Deutsche Bank": "db.com", DevRev: "devrev.ai", Devtron: "devtron.ai", "DXC Technology": "dxc.com",
  "Edelweiss Group": "edelweissfin.com", "Electronic Arts": "ea.com", "EPAM Systems": "epam.com",
  "Epic Systems": "epic.com", FPT: "fpt.com", Freecharge: "freecharge.in", "GE Digital": "ge.com",
  "General Motors": "gm.com", Graviton: "gravitontrading.com", Groww: "groww.in", Harness: "harness.io",
  HCL: "hcltech.com", Hive: "thehive.ai", Hiver: "hiverhq.com", "IIT Bombay": "iitb.ac.in",
  IMC: "imc.com", "Info Edge": "infoedge.in", "josh technology": "joshtechnologygroup.com",
  "Juniper Networks": "juniper.net", Juspay: "juspay.in", Kakao: "kakaocorp.com",
  "Larsen & Toubro": "larsentoubro.com", "Lendingkart Technologies": "lendingkart.com",
  Licious: "licious.in", Liftoff: "liftoff.io", LINE: "line.me", LTI: "ltimindtree.com",
  Lucid: "lucid.co", "Machine Zone": "mz.com", "Media.net": "media.net", Meta: "meta.com",
  Millennium: "mlp.com", MindTree: "ltimindtree.com", Mountblue: "mountblue.io",
  "National Instruments": "ni.com", "National Payments Corporation of India": "npci.org.in",
  Niantic: "nianticlabs.com", Notion: "notion.so", Nuro: "nuro.ai", "Ola Cabs": "olacabs.com",
  "Otter.ai": "otter.ai", oyo: "oyorooms.com", Ozon: "ozon.ru", "Palantir Technologies": "palantir.com",
  PayPay: "paypay.ne.jp", Peloton: "onepeloton.com", "persistent systems": "persistent.com",
  "Pony.ai": "pony.ai", RBC: "rbc.com", redbus: "redbus.in", "Scale AI": "scale.com",
  Sentry: "sentry.io", Slice: "sliceit.com", SOTI: "soti.net",
  "Squarepoint Capital": "squarepoint-capital.com", "Texas Instruments": "ti.com", Tinkoff: "tbank.ru",
  Toast: "toasttab.com", "Tower Research Capital": "tower-research.com", Twitch: "twitch.tv",
  Valve: "valvesoftware.com", "Veeva Systems": "veeva.com", "Virtu Financial": "virtu.com",
  VK: "vk.com", "Walmart Labs": "walmart.com", Warnermedia: "wbd.com", WeRide: "weride.ai",
  WinZO: "winzogames.com", "Wissen Technology": "wissen.com", "Works Applications": "worksap.com",
  Zeta: "zeta.tech", "zeta suite": "zeta.tech", Zepto: "zeptonow.com", "ZS Associates": "zs.com",
  Zoom: "zoom.us", Unity: "unity.com", "Hudson River Trading": "hudsonrivertrading.com",
};

const slugify = (s) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const titleCase = (d) => d.charAt(0) + d.slice(1).toLowerCase(); // EASY -> Easy

/** Minimal RFC-4180 CSV parser (handles quoted fields, escaped quotes, CRLF). */
function parseCsv(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((f) => f !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((f) => f !== "")) rows.push(row);
  const [header, ...body] = rows;
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? "").trim()])));
}

function readCsv(file) {
  return fs.existsSync(file) ? parseCsv(fs.readFileSync(file, "utf8")) : [];
}

function questionSlug(link) {
  const m = link.match(/problems\/([^/?#]+)/);
  return m ? m[1] : slugify(link);
}

if (!fs.existsSync(SRC)) {
  console.error(`Source folder not found: ${SRC}`);
  process.exit(1);
}
fs.mkdirSync(OUT, { recursive: true });

let companies = 0, rows = 0;
for (const dir of fs.readdirSync(SRC).sort((a, b) => a.localeCompare(b))) {
  const full = path.join(SRC, dir);
  if (dir.startsWith(".") || !fs.statSync(full).isDirectory()) continue;
  const all = readCsv(path.join(full, ALL_FILE));
  if (all.length === 0) continue;

  // which time windows each question appeared in
  const periods = new Map();
  for (const [file, key] of Object.entries(PERIOD_FILES)) {
    for (const r of readCsv(path.join(full, file))) {
      const s = questionSlug(r.Link);
      if (!periods.has(s)) periods.set(s, []);
      periods.get(s).push(key);
    }
  }

  const seen = new Set();
  const questions = [];
  for (const r of all) {
    const slug = questionSlug(r.Link);
    if (seen.has(slug)) continue;
    seen.add(slug);
    questions.push({
      title: r.Title,
      slug,
      difficulty: titleCase(r.Difficulty),
      link: r.Link,
      frequency: Number(r.Frequency) || 0,
      // the source stores acceptance 100x too small (Two Sum = 0.0058) -> convert to percent
      acceptance: Math.round(Number(r["Acceptance Rate"]) * 10000 * 10) / 10,
      topics: r.Topics ? r.Topics.split(",").map((t) => t.trim()).filter(Boolean) : [],
      periods: periods.get(slug) ?? [],
    });
  }

  const slug = slugify(dir);
  const outFile = path.join(OUT, `${slug}.json`);
  const prev = fs.existsSync(outFile) ? JSON.parse(fs.readFileSync(outFile, "utf8")) : {};
  const company = {
    name: prev.name ?? dir,
    slug,
    domain: prev.domain ?? DOMAINS[dir] ?? `${dir.toLowerCase().replace(/[^a-z0-9.]/g, "")}.com`.replace(/\.com\.com$/, ".com"),
    ...(prev.logo ? { logo: prev.logo } : {}),
    questions,
  };
  fs.writeFileSync(outFile, JSON.stringify(company, null, 2) + "\n");
  companies++;
  rows += questions.length;
}

console.log(`Imported ${companies} companies, ${rows} company-question rows -> ${path.relative(ROOT, OUT)}`);
