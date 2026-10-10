import type { Comfort, Company, Pace, Plan } from "@/lib/brief";

export type Personality = {
  pace: Pace;
  company: Company;
  comfort: Comfort;
  plan: Plan;
};

export type PlacePick = {
  place: string;
  why: string;
};

type Flexible<T extends string> = T | "either";

type Place = {
  name: string;
  pace: Pace;
  company: Flexible<Company>;
  comfort: Flexible<Comfort>;
  plan: Flexible<Plan>;
  because: string;
};

const PLACES: Place[] = [
  {
    name: "Crete",
    pace: "slow",
    company: "quiet",
    comfort: "simple",
    plan: "loose",
    because: "The island is large, with beaches and small towns, and the nights stay quiet.",
  },
  {
    name: "Paphos",
    pace: "slow",
    company: "quiet",
    comfort: "simple",
    plan: "loose",
    because: "It is a small harbour town, easy to keep unhurried.",
  },
  {
    name: "Madeira",
    pace: "slow",
    company: "quiet",
    comfort: "either",
    plan: "loose",
    because: "The island is walking, levadas, and a town, with evenings that stay small.",
  },
  {
    name: "Seville",
    pace: "slow",
    company: "quiet",
    comfort: "either",
    plan: "loose",
    because: "It is a smaller city, easy to keep to yourself between long lunches.",
  },
  {
    name: "Dubrovnik",
    pace: "slow",
    company: "quiet",
    comfort: "either",
    plan: "loose",
    because: "The old town is compact, and the days can stay gentle.",
  },
  {
    name: "Maldives",
    pace: "slow",
    company: "quiet",
    comfort: "treat",
    plan: "loose",
    because: "The stay is the water and the villa, with very little else to arrange.",
  },
  {
    name: "Mauritius",
    pace: "slow",
    company: "quiet",
    comfort: "treat",
    plan: "either",
    because: "The coast is resort bays and long, quiet afternoons.",
  },
  {
    name: "Halkidiki",
    pace: "slow",
    company: "quiet",
    comfort: "treat",
    plan: "either",
    because: "It is a polished stretch of coast where the day can end early.",
  },
  {
    name: "Prague",
    pace: "mixed",
    company: "quiet",
    comfort: "either",
    plan: "loose",
    because: "The centre is compact, easy to wander and then stop.",
  },
  {
    name: "Bologna",
    pace: "mixed",
    company: "quiet",
    comfort: "either",
    plan: "loose",
    because: "It is a food city on a human scale, easy to wander and then stop.",
  },
  {
    name: "Porto",
    pace: "mixed",
    company: "quiet",
    comfort: "simple",
    plan: "loose",
    because: "The river and the tiled streets give you a city you can take slowly.",
  },
  {
    name: "Lisbon",
    pace: "mixed",
    company: "either",
    comfort: "either",
    plan: "loose",
    because: "The hills and the miradouros give you a city you can take slowly.",
  },
  {
    name: "Nice",
    pace: "mixed",
    company: "either",
    comfort: "treat",
    plan: "loose",
    because: "The promenade and the old town leave the afternoon open.",
  },
  {
    name: "Corfu",
    pace: "mixed",
    company: "quiet",
    comfort: "treat",
    plan: "loose",
    because: "The bays are green and the evenings stay small.",
  },
  {
    name: "Barbados",
    pace: "mixed",
    company: "quiet",
    comfort: "treat",
    plan: "either",
    because: "The west coast is a long, polished beach rather than a loud strip.",
  },
  {
    name: "Paris",
    pace: "mixed",
    company: "either",
    comfort: "treat",
    plan: "either",
    because: "The city can be one outing and a long lunch, or a fuller day.",
  },
  {
    name: "Tenerife",
    pace: "mixed",
    company: "lively",
    comfort: "either",
    plan: "either",
    because: "The south has restaurants and people out in the evening, with room for a slower morning.",
  },
  {
    name: "Rome",
    pace: "full",
    company: "either",
    comfort: "treat",
    plan: "booked",
    because: "You can fill every day, and the city rewards a plan you already know.",
  },
  {
    name: "Orlando",
    pace: "full",
    company: "either",
    comfort: "either",
    plan: "booked",
    because: "The days are laid out around the parks, which suits a fixed week.",
  },
  {
    name: "St Lucia",
    pace: "slow",
    company: "quiet",
    comfort: "treat",
    plan: "booked",
    because: "The pitons and the resort coast suit a stay that is already shaped.",
  },
  {
    name: "Dubai",
    pace: "full",
    company: "lively",
    comfort: "treat",
    plan: "either",
    because: "The hotels, the dining, and the scale of the evenings match a full, polished stay.",
  },
  {
    name: "Las Vegas",
    pace: "full",
    company: "lively",
    comfort: "treat",
    plan: "booked",
    because: "The strip keeps the days and the nights full, in one concentrated place.",
  },
  {
    name: "Cancun",
    pace: "full",
    company: "lively",
    comfort: "treat",
    plan: "either",
    because: "The hotel zone is built for long days and busy evenings.",
  },
  {
    name: "Barcelona",
    pace: "full",
    company: "lively",
    comfort: "either",
    plan: "either",
    because: "The beach, the bars, and the streets stay busy into the evening.",
  },
  {
    name: "New York",
    pace: "full",
    company: "lively",
    comfort: "either",
    plan: "either",
    because: "The neighbourhoods stay busy from morning until late.",
  },
  {
    name: "Madrid",
    pace: "full",
    company: "lively",
    comfort: "either",
    plan: "either",
    because: "The days run late, and the evenings are part of the city.",
  },
  {
    name: "Berlin",
    pace: "full",
    company: "lively",
    comfort: "simple",
    plan: "loose",
    because: "The days and the nights can both be full, without a formal setting.",
  },
];

function axisScore<T extends string>(answer: T, place: Flexible<T>): number {
  if (answer === place) return 3;
  if (answer === "either" || place === "either") return 1;
  return -2;
}

function scorePlace(place: Place, personality: Personality): number {
  return (
    axisScore(personality.pace, place.pace) +
    axisScore(personality.company, place.company) +
    axisScore(personality.comfort, place.comfort) +
    axisScore(personality.plan, place.plan)
  );
}

export function pacePhrase(pace: Pace): string {
  if (pace === "slow") return "slow days";
  if (pace === "full") return "full days";
  return "a mix of one outing and a rest";
}

export function companyPhrase(company: Company): string {
  if (company === "quiet") return "quiet company";
  if (company === "lively") return "lively company";
  return "no preference about who else is around";
}

export function comfortPhrase(comfort: Comfort): string {
  if (comfort === "simple") return "a simple room";
  if (comfort === "treat") return "a treat of a hotel";
  return "an ordinary comfortable room";
}

export function planPhrase(plan: Plan): string {
  if (plan === "loose") return "a loose plan";
  if (plan === "booked") return "the days already set";
  return "a few plans and the rest free";
}

function wants(personality: Personality): string {
  return `${pacePhrase(personality.pace)}, ${companyPhrase(personality.company)}, ${comfortPhrase(personality.comfort)}, and ${planPhrase(personality.plan)}`;
}

export function personalityLine(personality: Personality): string {
  return `You want ${wants(personality)}.`;
}

function whyFor(place: Place, personality: Personality): string {
  return `${place.name} is on your shortlist because you want ${wants(personality)}. ${place.because}`;
}

export function recommendFromPersonality(personality: Personality): PlacePick[] {
  return PLACES.map((place, index) => ({ place, index, score: scorePlace(place, personality) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 3)
    .map(({ place }) => ({
      place: place.name,
      why: whyFor(place, personality),
    }));
}
