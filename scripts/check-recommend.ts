import assert from "node:assert/strict";
import { extractPrice, parseLiteHtml, chooseHolidays } from "../src/lib/rank";
import { plannedSearches, type Brief } from "../src/lib/brief";
import { FLOW, recommendFromPersonality } from "../src/lib/personality-places";

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
  pace: "slow",
  company: "quiet",
  comfort: "simple",
  plan: "loose",
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
assert.equal(
  shortlist.results.find((result) => result.host === "other.example"),
  undefined,
);
assert.equal(shortlist.results.filter((result) => result.host === "example.com").length, 1);

const over = chooseHolidays(
  [
    {
      title: "Tenerife in February",
      url: "https://example.com/tenerife",
      snippet:
        "7 nights all-inclusive from around £600-£850 per person in low season, £900-£1,300 per person in the February half-term.",
      query: "tenerife",
      price: { amount: 900, sentence: "£900-£1,300 per person in the February half-term" },
    },
    {
      title: "May in Gran Canaria",
      url: "https://example.com/gran",
      snippet: "May 2027, 7 nights all inclusive from Manchester, £373 per person.",
      query: "gran",
      price: { amount: 373, sentence: "£373 per person" },
    },
  ],
  { ...brief, budget: 800 },
  "10 October 2026, 22:36",
  ["tenerife", "gran"],
);
assert.equal(over.results[0]?.fit, "over");
assert.match(over.results[0]?.fitNote ?? "", /over the £800/);
assert.doesNotMatch(over.results[0]?.fitNote ?? "", /close enough|Fits/);
assert.equal(over.results.find((result) => result.title.includes("May")), undefined);
assert.equal(over.cleanCount, 0);
assert.match(over.intro, /Gran Canaria|gran/i);

const quietBeach = plannedSearches({ ...brief, style: "beach", company: "quiet", pace: "slow", comfort: "simple" });
assert.equal(quietBeach[0]?.place, "Algarve");
assert.match(quietBeach[0]?.query ?? "", /Algarve package holiday from London February 2027 7 nights flights budget hotel per person/);
assert.match(quietBeach[0]?.why ?? "", /quiet/);
assert.match(quietBeach[0]?.why ?? "", /Algarve/);
const livelyBeach = plannedSearches({ ...brief, style: "beach", company: "lively", pace: "full", comfort: "treat" });
assert.equal(livelyBeach[0]?.place, "Ibiza");
assert.match(livelyBeach[0]?.query ?? "", /luxury hotel/);

assert.equal(FLOW.filter((question) => question.kind === "choice").length, 8);
assert.equal(FLOW.filter((question) => question.kind === "open").length, 4);

const written = {
  travellingFor: "my sister and me",
  remember: "a long swim",
  avoid: "queues",
  loved: "a small harbour",
};
const quietPersonality = recommendFromPersonality({
  pace: "slow",
  company: "quiet",
  comfort: "simple",
  plan: "loose",
  setting: "sea",
  distance: "near",
  food: "incidental",
  morning: "late",
  ...written,
});
assert.equal(quietPersonality.length, 3);
const quietNames = quietPersonality.map((pick) => pick.place);
assert.deepEqual(quietNames, ["Crete", "Paphos", "Dubrovnik"]);
for (const blocked of ["Barcelona", "New York", "Las Vegas", "Dubai", "Berlin"]) {
  assert.equal(quietNames.includes(blocked), false, blocked);
}
for (const pick of quietPersonality) {
  assert.match(pick.why, new RegExp(pick.place));
  assert.match(pick.why, /sister/);
  assert.match(pick.why, /swim/);
  assert.match(pick.why, /queues/);
  assert.match(pick.why, /harbour/);
  assert.equal(pick.why.includes("£"), false);
  assert.equal(/flight/i.test(pick.why), false);
  assert.equal(/\bbook/i.test(pick.why), false);
}

const avoidSea = recommendFromPersonality({
  pace: "slow",
  company: "quiet",
  comfort: "simple",
  plan: "loose",
  setting: "sea",
  distance: "near",
  food: "incidental",
  morning: "late",
  ...written,
  avoid: "beaches and the sea",
});
const avoidNames = avoidSea.map((pick) => pick.place);
assert.equal(avoidNames.includes("Crete"), false);
assert.equal(avoidNames.includes("Paphos"), false);
assert.equal(avoidNames[0], "Madeira");

const namedBerlin = recommendFromPersonality({
  pace: "slow",
  company: "quiet",
  comfort: "simple",
  plan: "loose",
  setting: "sea",
  distance: "near",
  food: "incidental",
  morning: "late",
  ...written,
  loved: "Berlin",
});
assert.equal(namedBerlin.some((pick) => pick.place === "Berlin"), true);

const livelyPersonality = recommendFromPersonality({
  pace: "full",
  company: "lively",
  comfort: "simple",
  plan: "loose",
  setting: "city",
  distance: "near",
  food: "incidental",
  morning: "late",
  travellingFor: "a group of friends",
  remember: "late streets",
  avoid: "a resort beach",
  loved: "a city that stays up",
});
const livelyNames = livelyPersonality.map((pick) => pick.place);
assert.equal(livelyNames[0], "Berlin");
for (const blocked of ["Madeira", "Crete", "Paphos", "Maldives"]) {
  assert.equal(livelyNames.includes(blocked), false, blocked);
}
assert.notDeepEqual(livelyNames, quietNames);

console.log("recommend checks passed");
