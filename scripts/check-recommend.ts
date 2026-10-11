import assert from "node:assert/strict";
import { extractPrice, parseLiteHtml, chooseHolidays } from "../src/lib/rank";
import { plannedSearches, type Brief } from "../src/lib/brief";
import { parseModelReply, parseModelShortlist } from "../src/lib/ai-recommend";
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

const shaped = parseModelShortlist(`
Place: Paphos
Why: A coastal town for a long swim with your sister, and the harbour stays quiet.
Place: Madeira
Why: Slow walks, and the queues you wanted to avoid are easy to miss.
Place: Seville
Why: Old streets for the two of you, with a late morning and no rush.
`);
assert.deepEqual(shaped?.map((pick) => pick.place), ["Paphos", "Madeira", "Seville"]);
assert.match(shaped?.[0]?.why ?? "", /sister/);
assert.equal(shaped?.[0]?.why.includes("£"), false);

const markdown = parseModelShortlist(`
1. **Name:** Berlin
Why: Late streets for a group of friends. The fare is £400 and the flight is extra.
2. **Name:** Madrid
Why: A city that stays up, with no resort beach in sight.
3. **Name:** Prague
Why: Near enough for a short trip, and the nights stay lively.
`);
assert.deepEqual(markdown?.map((pick) => pick.place), ["Berlin", "Madrid", "Prague"]);
assert.equal(markdown?.[0]?.why.includes("£"), false);
assert.equal(/flight/i.test(markdown?.[0]?.why ?? "flight"), false);

const niceHarbour = parseModelShortlist(`
You wanted a nice harbour.
Place: Paphos
Why: A harbour town for a long swim with your sister.
Place: Madeira
Why: Quiet paths, and the queues stay away from the walk.
Place: Lisbon
Why: A morning city with a small harbour and a slow pace.
`);
assert.deepEqual(niceHarbour?.map((pick) => pick.place), ["Paphos", "Madeira", "Lisbon"]);

const namedNice = parseModelShortlist(`
Place: Nice
Why: The promenade is the day, and the harbour is small.
Place: Rome
Why: A city morning with long walks and late lunches.
Place: Paris
Why: Streets you already loved, kept to a loose plan.
`);
assert.equal(namedNice?.[0]?.place, "Nice");

const longNames = parseModelShortlist(`
Place: New York
Why: Full days in a city that stays up with your friends.
Place: Las Vegas
Why: Nights are the point, and the plan can stay loose.
Place: St Lucia
Why: A long journey to the sea, if the group wants water.
`);
assert.deepEqual(longNames?.map((pick) => pick.place), ["New York", "Las Vegas", "St Lucia"]);

assert.equal(
  parseModelShortlist(`
Place: Berlin
Why: The same sentence about nights and friends here now.
Place: Madrid
Why: The same sentence about nights and friends here now.
Place: Prague
Why: The same sentence about nights and friends here now.
`),
  null,
);
assert.equal(parseModelShortlist("Place: Berlin\nWhy: Only one place was written here today."), null);

const numbered = parseModelShortlist(`
1. Place: Madeira) - Why: The warm climate on Madeira is perfect for a long swim with your sister.
2. Place: Seville Why: Seville keeps a loose plan and a simple room for the two of you. 3. Place: Barbaodis (
3. Place: Barbados Why: The beach stays quiet, and queues stay off the sand.
`);
assert.deepEqual(numbered?.map((pick) => pick.place), ["Madeira", "Seville", "Barbados"]);
assert.match(numbered?.[0]?.why ?? "", /^The warm climate/);
assert.equal(numbered?.[1]?.why.includes("Barbaodis"), false);
assert.match(numbered?.[2]?.why ?? "", /^The beach stays quiet/);
assert.equal((numbered ?? []).some((pick) => /why:/i.test(pick.why)), false);

const quoted = parseModelShortlist(`
Place: Dubrovnik
Why: "A long swim with your sister, away from queues, beside a small harbour."
Place: Paphos
Why: The harbour stays small and the morning starts late.
Place: Corfu
Why: Slow days by the water, with crowds left behind.
`);
assert.match(quoted?.[0]?.why ?? "", /^A long swim/);
assert.equal(quoted?.[0]?.why.includes('"'), false);

const starred = parseModelShortlist(`
Place: 1. **Dubrovnik** - A picturesque coastal town with a long history, offering a serene environment perfect for relaxing on slow days. The nearby beaches provide ample opportunities to enjoy a leisurely swim without the rush of tourists.
2. **Madeira** - Known as the "Isle of Eternal Spring," Madeira offers a tranquil climate year-round, making it ideal for your sister and you to spend time together.
3. **Barcelona** - With its vibrant city life, Barcelona provides plenty of activities for both of you while still allowing for a relaxed pace.
`);
assert.deepEqual(starred?.map((pick) => pick.place), ["Dubrovnik", "Madeira", "Barcelona"]);
assert.match(starred?.[1]?.why ?? "", /sister/);
assert.equal(starred?.[1]?.why.includes('"'), false);
assert.doesNotMatch(starred?.[1]?.why ?? "", /Eternal Spring,\.$/);

const jsonReply = parseModelReply(`{
  "places": [
    {"place": "paphos", "why": "A long swim with your sister, beside a small harbour and away from queues."},
    {"place": "Madeira", "why": "Quiet paths for the two of you, with crowds left off the walk."},
    {"place": "Lisbon", "why": "A morning city and a small harbour, kept to a loose plan."}
  ]
}`);
assert.deepEqual(jsonReply?.map((pick) => pick.place), ["Paphos", "Madeira", "Lisbon"]);
assert.match(jsonReply?.[0]?.why ?? "", /sister/);

console.log("recommend checks passed");
