import assert from "node:assert/strict";
import { recommend } from "../src/lib/recommend";

const ski = recommend({
  year: 2027,
  month: 1,
  nights: 7,
  adults: 2,
  children: 0,
  budget: 800,
  style: "ski",
});
assert.equal(ski.results[0]?.holiday.id, "les-deux-alpes-serre-palas");
assert.equal(ski.results[0]?.fit, "clean");
assert.equal(ski.results[0]?.quote.perAdult, 556);
assert.ok(ski.results.some((result) => result.holiday.id === "les-deux-alpes-brunerie"));

const beach = recommend({
  year: 2027,
  month: 5,
  nights: 7,
  adults: 2,
  children: 0,
  budget: 600,
  style: "beach",
});
assert.equal(beach.results[0]?.holiday.id, "majorca-sol-house");
assert.equal(beach.results[0]?.fit, "clean");
assert.equal(beach.results[0]?.quote.perAdult, 534);

const family = recommend({
  year: 2027,
  month: 2,
  nights: 2,
  adults: 2,
  children: 2,
  budget: 900,
  style: "family",
});
assert.equal(family.results[0]?.holiday.id, "disneyland-hotel");
assert.equal(family.results[0]?.fit, "clean");
assert.equal(family.results[0]?.quote.perAdult, 650);
assert.equal(family.results[0]?.quote.perChild, 400);
assert.equal(family.results[0]?.quote.partyTotal, 2100);

const markets = recommend({
  year: 2026,
  month: 12,
  nights: 4,
  adults: 2,
  children: 0,
  budget: 500,
  style: "food",
});
assert.equal(markets.results[0]?.holiday.id, "vienna-budapest");
assert.equal(markets.results[0]?.fit, "clean");
assert.equal(markets.results[0]?.quote.partyTotal, 898);

const winter = recommend({
  year: 2027,
  month: 2,
  nights: 7,
  adults: 2,
  children: 0,
  budget: 700,
  style: "winter-sun",
});
assert.equal(winter.results[0]?.holiday.id, "marrakech-agadir");
assert.equal(winter.results[0]?.quote.perAdult, 559);
assert.equal(winter.results[0]?.fit, "clean");

const nothing = recommend({
  year: 2027,
  month: 7,
  nights: 7,
  adults: 2,
  children: 0,
  budget: 100,
  style: "ski",
});
assert.equal(nothing.cleanCount, 0);
assert.equal(nothing.results.length, 3);
assert.match(nothing.intro, /Nothing on the desk/);

const coupleSki = recommend({
  year: 2026,
  month: 12,
  nights: 7,
  adults: 2,
  children: 1,
  budget: 1200,
  style: "family",
});
const cretes = coupleSki.results.find((result) => result.holiday.id === "les-deux-alpes-cretes");
if (cretes) {
  assert.equal(cretes.fit, "close");
  assert.equal(cretes.quote.partyTotal, null);
}

console.log("recommend checks passed");
