import { gbp, monthName, monthYear, personalityPortrait, styleLabel, type Brief } from "@/lib/brief";

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
  fit: "clean" | "over" | "undated" | "wrong-month" | "elsewhere";
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

const OTHER_AIRPORT =
  /\b(?:from|departing|departure)\s+(manchester|birmingham|bristol|glasgow|edinburgh|newcastle|leeds|liverpool|cardiff|belfast)\b/i;

function judgedText(hit: SearchHit, priceSentence: string): string {
  return `${hit.title} ${hit.snippet} ${priceSentence}`;
}

function nightsMatch(text: string, nights: number): boolean {
  const counts = nightCounts(text);
  return counts.length === 0 || counts.some((count) => Math.abs(count - nights) <= 1);
}

export function judgeFit(
  hit: SearchHit,
  brief: Brief,
  price: number,
  priceSentence: string,
): FoundHoliday["fit"] {
  const text = judgedText(hit, priceSentence);
  const months = mentionedMonths(text);
  if (months.length > 0 && !months.includes(brief.month)) return "wrong-month";
  if (OTHER_AIRPORT.test(text)) return "elsewhere";
  if (!months.includes(brief.month) || !nightsMatch(text, brief.nights)) return "undated";
  if (price > brief.budget) return "over";
  return "clean";
}

function fitNote(
  hit: SearchHit,
  brief: Brief,
  price: number,
  priceSource: "listing" | "search",
  fit: FoundHoliday["fit"],
  priceSentence: string,
): string {
  const when = monthYear(brief.year, brief.month);
  const read =
    priceSource === "listing"
      ? "I opened the listing just now and read that fare on the page."
      : "That figure is printed in the search result. Open the listing before you book.";
  const months = mentionedMonths(judgedText(hit, priceSentence)).filter(
    (month) => month !== brief.month,
  );

  if (fit === "clean") {
    return `${gbp(price)} a person in ${when} is inside your ${gbp(brief.budget)}, for about ${brief.nights} nights from London. ${read}`;
  }
  if (fit === "over") {
    return `${monthName(brief.month)} is ${gbp(price)} a person, which is ${gbp(price - brief.budget)} over the ${gbp(brief.budget)} you set. ${read}`;
  }
  if (fit === "wrong-month") {
    return `This fare is for ${months.map(monthName).join(" and ")}, not ${when}. It is not a ${monthName(brief.month)} holiday.`;
  }
  if (fit === "elsewhere") {
    return `This fare does not leave from London. It is not the departure you asked for.`;
  }
  return `${gbp(price)} a person is what this search printed, and it does not name ${when}. It is not a fare for that month.`;
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
    const fit = judgeFit(item.hit, brief, item.price, priceSentence);
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

  const fitRank: Record<FoundHoliday["fit"], number> = {
    clean: 0,
    over: 1,
    undated: 2,
    elsewhere: 3,
    "wrong-month": 4,
  };
  const dated = results
    .filter((result) => result.fit === "clean" || result.fit === "over")
    .sort((a, b) => fitRank[a.fit] - fitRank[b.fit] || a.pricePerPerson - b.pricePerPerson);

  const cleanCount = dated.filter((result) => result.fit === "clean").length;
  const when = monthYear(brief.year, brief.month);
  const request = `a ${styleLabel(brief.style)} trip in ${when} for ${brief.adults} ${brief.adults === 1 ? "adult" : "adults"}${brief.children ? ` and ${brief.children} ${brief.children === 1 ? "child" : "children"}` : ""}, about ${brief.nights} nights, up to ${gbp(brief.budget)} a person, from London. ${personalityPortrait(brief)}`;
  const missed = queries
    .filter((query) => !dated.some((result) => result.searchQuery === query))
    .map((query) => query.split(/ \d+ nights/)[0] ?? query);
  const missedNote =
    missed.length > 0
      ? ` ${missed.join(" and ")} did not print a per-person fare for ${when}.`
      : "";
  let intro: string;
  if (dated.length === 0) {
    intro = `I searched the web just now for ${request}. None of the results printed a per-person fare for ${when}.${missedNote}`;
  } else if (cleanCount === 0) {
    intro = `The ${when} fares from this search are over ${gbp(brief.budget)} a person.${missedNote}`;
  } else if (cleanCount === dated.length) {
    intro = `${dated.length === 1 ? "One holiday" : `${dated.length} holidays`}, each from its own search just now, for ${request}.${missedNote}`;
  } else {
    intro = `${cleanCount === 1 ? "One listing fits" : `${cleanCount} listings fit`} ${request}. The other dated fare is over the budget.${missedNote}`;
  }

  return { intro, cleanCount, searchedAt, queries, results: dated };
}
