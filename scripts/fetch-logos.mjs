#!/usr/bin/env node
/**
 * Downloads a logo for every company in data/companies/*.json into public/logos/
 * and records it as the company's "logo" field, so logos are served locally.
 *
 *   node scripts/fetch-logos.mjs            # only companies without a local logo
 *   node scripts/fetch-logos.mjs --force    # re-download everything
 *   node scripts/fetch-logos.mjs amazon     # only the given slugs
 *
 * To fix a wrong logo: correct "domain" in the company's JSON, then rerun with its slug.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const DATA = path.join(ROOT, "data/companies");
const OUT = path.join(ROOT, "public/logos");
const args = process.argv.slice(2);
const force = args.includes("--force");
const only = args.filter((a) => !a.startsWith("--"));

const MIN_BYTES = 200; // anything smaller is a blank placeholder

const SOURCES = [
  (d) => `https://www.google.com/s2/favicons?domain=${d}&sz=256`,
  (d) => `https://icons.duckduckgo.com/ip3/${d}.ico`,
  (d) => `https://www.google.com/s2/favicons?domain=www.${d}&sz=256`,
  (d) => `https://${d}/apple-touch-icon.png`,
  (d) => `https://www.${d}/apple-touch-icon.png`,
];

const EXT = { "image/png": "png", "image/x-icon": "ico", "image/vnd.microsoft.icon": "ico", "image/svg+xml": "svg", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif" };

async function download(domain) {
  for (const src of SOURCES) {
    try {
      const res = await fetch(src(domain), { redirect: "follow", signal: AbortSignal.timeout(10_000) });
      // Google answers unknown domains with 404 + a generic globe, so only accept 200.
      if (res.status !== 200) continue;
      const type = (res.headers.get("content-type") ?? "").split(";")[0].trim();
      const ext = EXT[type];
      if (!ext) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < MIN_BYTES) continue;
      return { buf, ext };
    } catch {
      /* try next source */
    }
  }
  return null;
}

const files = fs.readdirSync(DATA).filter((f) => f.endsWith(".json"));
fs.mkdirSync(OUT, { recursive: true });

const queue = files.filter((f) => only.length === 0 || only.includes(f.replace(/\.json$/, "")));
const failed = [];
let saved = 0;
let skipped = 0;

async function worker() {
  while (queue.length) {
    const file = queue.shift();
    const p = path.join(DATA, file);
    const company = JSON.parse(fs.readFileSync(p, "utf8"));
    const local = company.logo?.startsWith("/logos/") && fs.existsSync(path.join(ROOT, "public", company.logo));
    if (local && !force && only.length === 0) { skipped++; continue; }

    const result = await download(company.domain);
    if (!result) { failed.push(`${company.slug} (${company.domain})`); continue; }

    for (const old of fs.readdirSync(OUT).filter((f) => f.startsWith(`${company.slug}.`))) fs.rmSync(path.join(OUT, old));
    const name = `${company.slug}.${result.ext}`;
    fs.writeFileSync(path.join(OUT, name), result.buf);

    // Keep "logo" right after "domain" so the JSON stays readable.
    const { questions, ...meta } = company;
    fs.writeFileSync(p, JSON.stringify({ ...meta, logo: `/logos/${name}`, questions }, null, 2) + "\n");
    saved++;
  }
}

await Promise.all(Array.from({ length: 12 }, worker));
console.log(`Saved ${saved} logos, skipped ${skipped} already local, ${failed.length} failed.`);
if (failed.length) console.log("No logo found for:\n  " + failed.join("\n  "));
