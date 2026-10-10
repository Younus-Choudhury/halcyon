import { monthName, searchQueries, type Brief } from "@/lib/brief";
import {
  bestPerQuery,
  chooseHolidays,
  extractPrice,
  parseLiteHtml,
  stripHtml,
  type PriceMention,
  type SearchHit,
  type Shortlist,
} from "@/lib/rank";

const BROWSER =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

async function searchLite(query: string): Promise<SearchHit[]> {
  const url = `https://lite.duckduckgo.com/lite/?${new URLSearchParams({ q: query })}`;
  const response = await fetch(url, {
    cache: "no-store",
    headers: { "User-Agent": BROWSER, Accept: "text/html" },
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) {
    throw new Error(`Search failed (${response.status})`);
  }
  return parseLiteHtml(await response.text(), query);
}

async function readListing(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      redirect: "follow",
      headers: { "User-Agent": BROWSER, Accept: "text/html" },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    const type = response.headers.get("content-type") ?? "";
    if (!type.includes("html") && !type.includes("text")) return null;
    const html = (await response.text()).slice(0, 400_000);
    return stripHtml(html);
  } catch {
    return null;
  }
}

export async function recommendLive(brief: Brief): Promise<Shortlist> {
  const queries = searchQueries(brief);
  const settled = await Promise.allSettled(queries.map((query) => searchLite(query)));
  const groups = settled.map((result) => (result.status === "fulfilled" ? result.value : []));
  const empty = groups.flatMap((group, index) => (group.length === 0 ? [index] : []));
  if (empty.length > 0) {
    const retried = await Promise.allSettled(empty.map((index) => searchLite(queries[index])));
    retried.forEach((result, index) => {
      if (result.status === "fulfilled" && result.value.length > 0) {
        groups[empty[index]] = result.value;
      }
    });
  }
  const failures = settled.filter((result) => result.status === "rejected").length;
  if (groups.every((group) => group.length === 0) && failures === queries.length) {
    throw new Error("The web search did not respond. Try again in a moment.");
  }

  const searchedAt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());

  const hits = bestPerQuery(groups, brief);
  const pagePrices = new Map<string, PriceMention>();
  await Promise.all(
    hits.map(async (hit) => {
      const text = await readListing(hit.url);
      if (!text) return;
      const found = extractPrice(text, brief.month);
      if (!found) return;
      if (!found.sentence.toLowerCase().includes(monthName(brief.month).toLowerCase())) return;
      pagePrices.set(hit.url, found);
    }),
  );

  return chooseHolidays(hits, brief, searchedAt, queries, pagePrices);
}
