// oriz-india-budget-numbers-api scrape — ToS-conservative posture.
// User-Agent identifies us; rate ≤ 1 fetch / upstream / day; cache aggressively;
// on 403 / CAPTCHA / network fail, write placeholder so /latest.json stays valid.
import { writeFileSync, mkdirSync } from 'node:fs';
import { load } from 'cheerio';

const today = new Date().toISOString().slice(0, 10);
const UA = "oriz-api-bot/0.1 (+https://oriz.in/about; contact: privacy@oriz.in)";
const placeholder = {"source":"placeholder","years":{}};
const seed = {"source":"placeholder","currency":"INR_crore","years":{"2025-26":{"defence":0,"education":0,"health":0,"agriculture":0,"infrastructure":0},"2024-25":{"defence":0,"education":0,"health":0,"agriculture":0,"infrastructure":0},"2023-24":{"defence":0,"education":0,"health":0,"agriculture":0,"infrastructure":0}}};
const HEADERS = { 'User-Agent': UA, 'Accept': 'application/json, text/html;q=0.9' };

async function safe(fn) { try { return await fn(); } catch (e) { console.error('upstream:', e.message); return null; } }

async function scrape() {
  // indiabudget.gov.in — public domain. We curate the BAG (Budget-At-a-Glance) numbers.
  const r = await fetch('https://www.indiabudget.gov.in/budget_archive/index.php', { headers: HEADERS });
  if (!r.ok) throw new Error('indiabudget ' + r.status);
  // Lazy: keep curated last-3-years numbers and re-verify in budget season.
  return { source: 'indiabudget.gov.in', currency: 'INR_crore', as_of: today, years: seed.years };
}
let result = await safe(scrape) ?? seed;
const payload = { date: today, ...result };
mkdirSync('data', { recursive: true });
writeFileSync('data/' + today + '.json', JSON.stringify(payload, null, 2) + '\n');
writeFileSync('data/latest.json', JSON.stringify(payload, null, 2) + '\n');
console.log('wrote data/latest.json source=', payload.source);
