import assert from "node:assert/strict";
import { extractPrice, parseLiteHtml, chooseHolidays } from "../src/lib/rank";
import type { Brief } from "../src/lib/brief";

const mixed =
  "WAS £899.00 p.p. Deposit from only £199 per person. The week is £599 per person in February.";
const price = extractPrice(mixed);
if (!price) throw new Error("expected a price");
assert.equal(price.amount, 599);
assert.match(price.sentence, /£599/);

assert.equal(extractPrice("Flights from £40. Deposit £60pp.")?.amount ?? null, null);

const februaryRange =
  "Tenerife holidays 2027 cost from £600 per person in low season, February half-term £900–£1,300, and five-star hotels from £1,100.";
const february = extractPrice(februaryRange, 2);
if (!february) throw new Error("expected a February price");
assert.equal(february.amount, 900);

const html = `
<a rel="nofollow" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fexample.com%2Flanzarote&amp;rut=abc" class='result-link'>7 nights in Lanzarote from London</a>
<td class='result-snippet'>February 2027, 7 nights, flights from London, £480 per person.</td>
<a href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FLanzarote" class='result-link'>Lanzarote</a>
<td class='result-snippet'>An island. Holidays from £100 per person.</td>
`;
const hits = parseLiteHtml(html, "lanzarote february");
assert.equal(hits.length, 1);
assert.equal(hits[0]?.price.amount, 480);
assert.equal(hits[0]?.url, "https://example.com/lanzarote");

const brief: Brief = {
  year: 2027,
  month: 2,
  nights: 7,
  adults: 2,
  children: 0,
  budget: 500,
  style: "winter-sun",
};
const shortlist = chooseHolidays(
  [
    ...hits,
    {
      title: "Same site again",
      url: "https://example.com/other",
      snippet: "February 2027, 7 nights, £300 per person from London.",
      query: "second",
      price: { amount: 300, sentence: "£300 per person" },
    },
    {
      title: "Crete week",
      url: "https://other.example/crete",
      snippet: "May only, 7 nights, £420 per person.",
      query: "third",
      price: { amount: 420, sentence: "£420 per person" },
    },
    {
      title: "Lisbon week",
      url: "https://city.example/lisbon",
      snippet: "February 2027, 7 nights, £450 per person from London.",
      query: "fourth",
      price: { amount: 450, sentence: "£450 per person" },
    },
  ],
  brief,
  "10 October 2026, 21:30",
  ["one", "two", "three"],
);
assert.equal(shortlist.results[0]?.url, "https://example.com/other");
assert.equal(shortlist.results[0]?.fit, "clean");
assert.equal(shortlist.results[0]?.partyTotal, 600);
const crete = shortlist.results.find((result) => result.host === "other.example");
assert.equal(crete?.fit, "close");
assert.equal(shortlist.results.filter((result) => result.host === "example.com").length, 1);

console.log("recommend checks passed");
