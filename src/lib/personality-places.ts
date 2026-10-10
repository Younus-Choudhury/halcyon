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
    name: "Fuerteventura",
    pace: "slow",
    company: "quiet",
    comfort: "simple",
    plan: "loose",
    because: "It is long beaches and small towns, and the nights stay quiet.",
  },
  {
    name: "Corsica",
    pace: "slow",
    company: "quiet",
    comfort: "simple",
    plan: "loose",
    because: "The coast is rugged and the towns are small, so the days stay open.",
  },
  {
    name: "Algarve",
    pace: "slow",
    company: "either",
    comfort: "simple",
    plan: "loose",
    because: "The coast is a string of beaches and towns, easy to keep unhurried.",
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
    name: "Menorca",
    pace: "slow",
    company: "quiet",
    comfort: "either",
    plan: "loose",
    because: "The island is coves and small harbours, with room to do very little.",
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
    name: "Lech",
    pace: "slow",
    company: "quiet",
    comfort: "treat",
    plan: "either",
    because: "It is a small Alpine village where the day can end early.",
  },
  {
    name: "Zermatt",
    pace: "mixed",
    company: "quiet",
    comfort: "treat",
    plan: "either",
    because: "The village is car-free, and the evenings stay civilised.",
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
    name: "Lisbon",
    pace: "mixed",
    company: "either",
    comfort: "either",
    plan: "loose",
    because: "The hills and the miradouros give you a city you can take slowly.",
  },
  {
    name: "Majorca",
    pace: "mixed",
    company: "either",
    comfort: "either",
    plan: "either",
    because: "The island can be a quiet bay or a busier town, depending on the day.",
  },
  {
    name: "Courchevel",
    pace: "mixed",
    company: "quiet",
    comfort: "treat",
    plan: "booked",
    because: "It is a polished resort, more hotel terrace than a loud village.",
  },
  {
    name: "Center Parcs",
    pace: "mixed",
    company: "quiet",
    comfort: "either",
    plan: "booked",
    because: "The village holds the whole stay, so the shape of the day is already there.",
  },
  {
    name: "San Sebastian",
    pace: "mixed",
    company: "either",
    comfort: "treat",
    plan: "loose",
    because: "The pintxos bars are the point, and you can still leave the afternoon open.",
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
    name: "Disneyland Paris",
    pace: "full",
    company: "either",
    comfort: "either",
    plan: "booked",
    because: "The days are laid out for you, which suits a fixed week.",
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
    name: "Ischgl",
    pace: "full",
    company: "lively",
    comfort: "treat",
    plan: "booked",
    because: "The village is known for lively evenings after a full day on the mountain.",
  },
  {
    name: "Gran Canaria",
    pace: "full",
    company: "lively",
    comfort: "either",
    plan: "either",
    because: "The south is built for resorts, dining, and staying out.",
  },
  {
    name: "Ibiza",
    pace: "full",
    company: "lively",
    comfort: "either",
    plan: "loose",
    because: "Beaches and music run through the island, and the days can stay full.",
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
    name: "Marrakech",
    pace: "full",
    company: "lively",
    comfort: "either",
    plan: "loose",
    because: "The medina is intense, social, and organised around long meals.",
  },
  {
    name: "Val Thorens",
    pace: "full",
    company: "lively",
    comfort: "simple",
    plan: "booked",
    because: "It is high and purpose-built, with a busy village after the slopes.",
  },
  {
    name: "Berlin",
    pace: "full",
    company: "lively",
    comfort: "simple",
    plan: "loose",
    because: "The days and the nights can both be full, without a formal setting.",
  },
  {
    name: "Ayia Napa",
    pace: "full",
    company: "lively",
    comfort: "simple",
    plan: "loose",
    because: "The resort is young and concentrated, with the days and nights in one place.",
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
