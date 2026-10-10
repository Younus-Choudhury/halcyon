import { gbp, monthName, monthYear, styleLabel, type Brief } from "@/lib/brief";

export type PriceMention = {
  amount: number;
  sentence: string;
};

export type SearchHit = {
  title: string;
  url: string;
  snippet: string;
  query: string;
  price: PriceMention;
};

export type FoundHoliday = {
  id: string;
  title: string;
  url: string;
  host: string;
  snippet: string;
  pricePerPerson: number;
  priceSentence: string;
  priceSource: "listing" | "search";
  searchQuery: string;
  fit: "clean" | "close";
  fitNote: string;
  partyTotal: number;
  partyNote: string;
};

export type Shortlist = {
  intro: string;
  cleanCount: number;
  searchedAt: string;
  queries: string[];
  results: FoundHoliday[];
};

const BLOCKED_HOST =
  /(^|\.)((wikipedia|facebook|instagram|youtube|tiktok|pinterest|reddit|linkedin)\.org|wikipedia\.com)$/i;

export function decodeHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&pound;/g, "£")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function stripHtml(html: string): string {
  return decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " "),
  );
}

export function unwrapDuckUrl(href: string): string | null {
  const raw = href.replace(/&amp;/g, "&");
  try {
    const absolute = raw.startsWith("//") ? `https:${raw}` : raw;
    const parsed = new URL(absolute, "https://duckduckgo.com");
    const wrapped = parsed.searchParams.get("uddg");
    if (wrapped) return wrapped;
    if (parsed.hostname.endsWith("duckduckgo.com")) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export function parseLiteHtml(html: string, query: string): SearchHit[] {
  const pattern =
    /<a[^>]*href="([^"]+)"[^>]*class='result-link'[^>]*>([\s\S]*?)<\/a>[\s\S]*?class='result-snippet'>([\s\S]*?)<\/td>/g;
  const hits: SearchHit[] = [];
  for (const match of html.matchAll(pattern)) {
    const url = unwrapDuckUrl(match[1]);
    if (!url || !url.startsWith("http")) continue;
    let host = "";
    try {
      host = new URL(url).hostname.replace(/^www\./, "");
    } catch {
      continue;
    }
    if (BLOCKED_HOST.test(host)) continue;
    const title = decodeHtml(match[2]);
    const snippet = decodeHtml(match[3]);
    if (/manage my booking|log in|sign in|wikipedia/i.test(title)) continue;
    const price = extractPrice(`${title}. ${snippet}`);
    if (!price) continue;
    hits.push({ title, url, snippet, query, price });
  }
  return hits;
}

const PER_PERSON = /per person|a person|(?<![a-z])pp\b|p\.p\b/i;

function priceCandidates(text: string): { amount: number; sentence: string; score: number }[] {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const found: { amount: number; sentence: string; score: number }[] = [];

  for (const sentence of sentences) {
    const sentenceLower = sentence.toLowerCase();
    const sentenceIsPerPerson = PER_PERSON.test(sentenceLower);
    const clauses = sentence
      .split(/,\s+/)
      .map((clause) => clause.trim())
      .filter(Boolean);

    for (const clause of clauses) {
      const lower = clause.toLowerCase();
      if (/\bdeposit\b/.test(lower)) continue;
      const perPerson = sentenceIsPerPerson || PER_PERSON.test(lower);
      if (!perPerson) continue;
      for (const match of clause.matchAll(
        /£\s*([0-9]{1,3}(?:,[0-9]{3})+|[0-9]+)(?:\.(\d{2}))?/g,
      )) {
        const amount = Number(match[1].replace(/,/g, ""));
        if (amount < 50 || amount > 15000) continue;
        const index = match.index ?? 0;
        const before = clause.slice(Math.max(0, index - 16), index).toLowerCase();
        if (/\bwas\b|\brrp\b|\bsave\b/.test(before)) continue;
        const after = clause.slice(index, index + match[0].length + 24).toLowerCase();
        if (after.includes("deposit")) continue;
        let score = 6;
        if (/package|holiday|nights?|flights?/.test(`${sentenceLower} ${lower}`)) score += 2;
        found.push({ amount, sentence: clause, score });
      }
    }
  }

  return found;
}

export function extractPrice(text: string, month?: number): PriceMention | null {
  const found = priceCandidates(text);
  if (found.length === 0) return null;

  let pool = found;
  if (month) {
    const name = monthName(month).toLowerCase();
    const inMonth = found.filter((candidate) => candidate.sentence.toLowerCase().includes(name));
    if (inMonth.length > 0) pool = inMonth;
  }

  pool.sort((a, b) => b.score - a.score || a.amount - b.amount);
  const best = pool[0];
  return { amount: best.amount, sentence: best.sentence };
}

function nightCounts(text: string): number[] {
  return [...text.matchAll(/(\d+)\s*[- ]?\s*nights?/gi)].map((match) => Number(match[1]));
}

function mentionedMonths(text: string): number[] {
  const lower = text.toLowerCase();
  const found: number[] = [];
  for (let month = 1; month <= 12; month += 1) {
    if (lower.includes(monthName(month).toLowerCase())) found.push(month);
  }
  return found;
}

export function bestPerQuery(groups: SearchHit[][], brief: Brief): SearchHit[] {
  const used = new Set<string>();
  const chosen: SearchHit[] = [];

  for (const group of groups) {
    const ranked = group
      .map((hit) => {
        const price = extractPrice(`${hit.title}. ${hit.snippet}`, brief.month) ?? hit.price;
        const priced = { ...hit, price };
        return { hit: priced, score: scoreHit(priced, brief, price.amount) };
      })
      .sort((a, b) => b.score - a.score || a.hit.price.amount - b.hit.price.amount);
    const pick = ranked.find((item) => !used.has(hostOf(item.hit.url))) ?? ranked[0];
    if (!pick) continue;
    chosen.push(pick.hit);
    used.add(hostOf(pick.hit.url));
  }

  return chosen;
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function fitNote(
  hit: SearchHit,
  brief: Brief,
  price: number,
  priceSource: "listing" | "search",
  fit: "clean" | "close",
  priceSentence: string,
): string {
  const when = monthYear(brief.year, brief.month);
  const months = mentionedMonths(`${hit.title} ${hit.snippet} ${priceSentence}`);
  const nights = nightCounts(`${hit.title} ${hit.snippet} ${priceSentence}`);
  const sentences: string[] = [];

  sentences.push(
    fit === "clean"
      ? `This is a ${styleLabel(brief.style)} listing the search just returned, and the fare is close enough to use.`
      : `The search returned this priced listing. It is not a clean match for the brief.`,
  );

  if (months.includes(brief.month)) {
    sentences.push(`The result mentions ${monthName(brief.month)}.`);
  } else if (months.length > 0) {
    sentences.push(
      `The result talks about ${months.map(monthName).join(" and ")}, not ${when}.`,
    );
  } else {
    sentences.push(`It does not name ${when}, so the fare may be a from-price for other dates.`);
  }

  if (nights.length === 0) {
    sentences.push(`It does not say it is ${brief.nights} nights.`);
  } else if (nights.some((count) => Math.abs(count - brief.nights) <= 1)) {
    sentences.push(`The length matches the ${brief.nights} nights you asked for.`);
  } else {
    sentences.push(`You asked for ${brief.nights} nights. The result says ${nights.join(" or ")}.`);
  }

  const over = price - brief.budget;
  if (over <= 0) {
    sentences.push(`${gbp(price)} a person is inside your ${gbp(brief.budget)}.`);
  } else {
    sentences.push(`It is ${gbp(over)} a person over the ${gbp(brief.budget)} you set.`);
  }

  if (priceSource === "listing") {
    sentences.push("I opened the listing just now and read that fare on the page.");
  } else {
    sentences.push(
      "That fare is the one printed in the search result. The listing page did not show a per-person price I could read, so open it before you treat this as bookable.",
    );
  }

  return sentences.join(" ");
}

function isClean(hit: SearchHit, brief: Brief, price: number, priceSentence: string): boolean {
  const text = `${hit.title} ${hit.snippet} ${priceSentence}`;
  const months = mentionedMonths(text);
  const nights = nightCounts(text);
  if (price > brief.budget * 1.15) return false;
  if (!months.includes(brief.month)) return false;
  if (nights.length > 0 && nights.every((count) => Math.abs(count - brief.nights) > 1)) return false;
  return true;
}

function scoreHit(hit: SearchHit, brief: Brief, price: number): number {
  const text = `${hit.title} ${hit.snippet}`.toLowerCase();
  let score = 0;
  const ratio = price / brief.budget;
  if (ratio <= 1) score += 28;
  else if (ratio <= 1.15) score += 10;
  else if (ratio <= 1.4) score -= 8;
  else score -= 18;
  if (text.includes(monthName(brief.month).toLowerCase())) score += 16;
  if (text.includes(String(brief.year))) score += 8;
  if (text.includes("london")) score += 8;
  const nights = nightCounts(text);
  if (nights.some((count) => count === brief.nights)) score += 14;
  else if (nights.some((count) => Math.abs(count - brief.nights) <= 2)) score += 6;
  if (text.includes(styleLabel(brief.style))) score += 4;
  return score;
}

export function chooseHolidays(
  hits: SearchHit[],
  brief: Brief,
  searchedAt: string,
  queries: string[],
  pagePrices: Map<string, PriceMention> = new Map(),
): Shortlist {
  const unique = new Map<string, SearchHit>();
  for (const hit of hits) {
    const key = hit.url.split("?")[0].replace(/\/$/, "");
    if (!unique.has(key)) unique.set(key, hit);
  }

  const ranked = [...unique.values()]
    .map((hit) => {
      const refined = extractPrice(`${hit.title}. ${hit.snippet}`, brief.month) ?? hit.price;
      const pricedHit = refined.amount === hit.price.amount ? hit : { ...hit, price: refined };
      const fromPage = pagePrices.get(hit.url);
      const price = fromPage?.amount ?? pricedHit.price.amount;
      return { hit: pricedHit, price, score: scoreHit(pricedHit, brief, price), fromPage };
    })
    .sort((a, b) => b.score - a.score || a.price - b.price);

  const picked: typeof ranked = [];
  const deferred: typeof ranked = [];
  for (const item of ranked) {
    const host = hostOf(item.hit.url);
    if (picked.some((choice) => hostOf(choice.hit.url) === host)) {
      deferred.push(item);
      continue;
    }
    picked.push(item);
    if (picked.length === 3) break;
  }
  for (const item of deferred) {
    if (picked.length === 3) break;
    picked.push(item);
  }

  const results: FoundHoliday[] = picked.map((item) => {
    const priceSource = item.fromPage ? "listing" : "search";
    const priceSentence = item.fromPage?.sentence ?? item.hit.price.sentence;
    const fit = isClean(item.hit, brief, item.price, priceSentence) ? "clean" : "close";
    const partyTotal = item.price * brief.adults;
    let partyNote = `${gbp(partyTotal)} for ${brief.adults} ${brief.adults === 1 ? "adult" : "adults"} at ${gbp(item.price)} each.`;
    if (brief.children > 0) {
      partyNote += " The result did not publish a child fare, so the children are not in that total.";
    }
    return {
      id: item.hit.url,
      title: item.hit.title,
      url: item.hit.url,
      host: hostOf(item.hit.url),
      snippet: item.hit.snippet,
      pricePerPerson: item.price,
      priceSentence,
      priceSource,
      searchQuery: item.hit.query,
      fit,
      fitNote: fitNote(item.hit, brief, item.price, priceSource, fit, priceSentence),
      partyTotal,
      partyNote,
    };
  });

  const cleanCount = results.filter((result) => result.fit === "clean").length;
  const request = `a ${styleLabel(brief.style)} trip in ${monthYear(brief.year, brief.month)} for ${brief.adults} ${brief.adults === 1 ? "adult" : "adults"}${brief.children ? ` and ${brief.children} ${brief.children === 1 ? "child" : "children"}` : ""}, about ${brief.nights} nights, up to ${gbp(brief.budget)} a person, from London`;
  let intro: string;
  if (results.length === 0) {
    intro = `I searched the web just now for ${request}. None of the results printed a per-person fare I could use. Try again, or change the month or the style.`;
  } else if (cleanCount === 0) {
    intro = `Nothing from this search is a clean match for ${request}. These are the priced listings that came back, and each note says what is off.`;
  } else if (cleanCount === results.length) {
    intro = `${results.length === 1 ? "One holiday" : `${results.length} holidays`}, each from its own search just now, for ${request}.`;
  } else {
    intro = `${cleanCount === 1 ? "One listing fits" : `${cleanCount} listings fit`} ${request}. The others came back from their own searches, with the gap spelled out.`;
  }

  return { intro, cleanCount, searchedAt, queries, results };
}
