export type TripStyle =
  | "winter-sun"
  | "city"
  | "beach"
  | "ski"
  | "family"
  | "food";

export type Pace = "slow" | "mixed" | "full";
export type Company = "quiet" | "either" | "lively";
export type Comfort = "simple" | "either" | "treat";
export type Plan = "loose" | "either" | "booked";

export type Brief = {
  year: number;
  month: number;
  nights: number;
  adults: number;
  children: number;
  budget: number;
  style: TripStyle;
  pace: Pace | null;
  company: Company | null;
  comfort: Comfort | null;
  plan: Plan | null;
};

export type PersonalityQuestion = {
  id: "pace" | "company" | "comfort" | "plan";
  prompt: string;
  options: { id: string; label: string; hint: string }[];
};

export const PERSONALITY_QUESTIONS: PersonalityQuestion[] = [
  {
    id: "pace",
    prompt: "How do you want the days to feel?",
    options: [
      { id: "slow", label: "Slow", hint: "A book, a swim, nowhere to be" },
      { id: "mixed", label: "A bit of both", hint: "One outing, then nothing" },
      { id: "full", label: "Full", hint: "Out after breakfast" },
    ],
  },
  {
    id: "company",
    prompt: "Who else should be around?",
    options: [
      { id: "quiet", label: "Quiet", hint: "Your own terrace" },
      { id: "either", label: "Don't mind", hint: "Either is fine" },
      { id: "lively", label: "Lively", hint: "People, music, a bar" },
    ],
  },
  {
    id: "comfort",
    prompt: "What should the room be?",
    options: [
      { id: "simple", label: "Simple", hint: "Clean, and the money spent elsewhere" },
      { id: "either", label: "Either", hint: "A decent bed is enough" },
      { id: "treat", label: "A treat", hint: "The good hotel" },
    ],
  },
  {
    id: "plan",
    prompt: "How fixed is the plan?",
    options: [
      { id: "loose", label: "Loose", hint: "Decide on the day" },
      { id: "either", label: "Some of each", hint: "A few bookings, then free" },
      { id: "booked", label: "Booked", hint: "Know what is on" },
    ],
  },
];

export const STYLE_OPTIONS: { id: TripStyle; label: string; hint: string }[] = [
  { id: "winter-sun", label: "Winter sun", hint: "Warmth while London is grey" },
  { id: "city", label: "City break", hint: "Streets, a museum, a proper hotel" },
  { id: "beach", label: "Beach", hint: "Sand, a pool, and not much else" },
  { id: "ski", label: "Ski", hint: "Snow and a week in the Alps" },
  { id: "family", label: "Family", hint: "Somewhere that works with children" },
  { id: "food", label: "Food and culture", hint: "Markets, a riad, a long lunch" },
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const STYLE_PLACES: Record<TripStyle, [string, string, string]> = {
  "winter-sun": ["Lanzarote", "Tenerife", "Gran Canaria"],
  city: ["Rome", "Lisbon", "Prague"],
  beach: ["Majorca", "Crete", "Algarve"],
  ski: ["Les Deux Alpes", "Val Thorens", "Mayrhofen"],
  family: ["Disneyland Paris", "Majorca family", "Tenerife family"],
  food: ["Marrakech", "Bologna", "Lisbon"],
};

const QUIET_PLACES: Record<TripStyle, [string, string, string]> = {
  "winter-sun": ["Lanzarote", "Fuerteventura", "Madeira"],
  city: ["Lisbon", "Seville", "Bologna"],
  beach: ["Algarve", "Menorca", "Corsica"],
  ski: ["Lech", "Zermatt", "Courchevel"],
  family: ["Center Parcs", "Menorca", "Madeira"],
  food: ["Bologna", "Lyon", "San Sebastian"],
};

const LIVELY_PLACES: Record<TripStyle, [string, string, string]> = {
  "winter-sun": ["Tenerife", "Gran Canaria", "Dubai"],
  city: ["Barcelona", "Rome", "Berlin"],
  beach: ["Ibiza", "Majorca", "Ayia Napa"],
  ski: ["Val Thorens", "Mayrhofen", "Ischgl"],
  family: ["Disneyland Paris", "Majorca", "Algarve"],
  food: ["Barcelona", "Rome", "Marrakech"],
};

export function monthName(month: number): string {
  return MONTHS[month - 1] ?? "";
}

export function monthYear(year: number, month: number): string {
  return `${monthName(month)} ${year}`;
}

export function monthOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  let year = 2026;
  let month = 10;
  while (year < 2027 || (year === 2027 && month <= 12)) {
    options.push({
      value: `${year}-${month}`,
      label: monthYear(year, month),
    });
    month += 1;
    if (month === 13) {
      month = 1;
      year += 1;
    }
  }
  return options;
}

export function gbp(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function styleLabel(style: TripStyle): string {
  return STYLE_OPTIONS.find((option) => option.id === style)?.label.toLowerCase() ?? style;
}

function placesFor(brief: Brief): [string, string, string] {
  if (brief.company === "quiet") return QUIET_PLACES[brief.style];
  if (brief.company === "lively") return LIVELY_PLACES[brief.style];
  return STYLE_PLACES[brief.style];
}

const PLACE_CHARACTER: Record<string, string> = {
  Lanzarote: "The resorts are spread out, and the evenings are quieter than Tenerife's south.",
  Fuerteventura: "It is beaches and small towns, with less nightlife than Gran Canaria.",
  Madeira: "It is walking, levadas, and a town, not a beach party strip.",
  Tenerife: "The south has the hotels, the restaurants, and the busier evenings.",
  "Gran Canaria": "The south is built for resorts, dining, and people staying out.",
  Dubai: "The hotels, the dining, and the evenings are on a big scale.",
  Rome: "You can fill every day, and the streets stay busy after dark.",
  Lisbon: "The city is walkable and the evenings are gentler than Barcelona.",
  Prague: "The centre is compact, so a few days can be full without a long commute.",
  Seville: "It is a smaller city, easier to keep to yourself than Madrid.",
  Bologna: "It is a food city on a human scale, not a capital that runs all night.",
  Barcelona: "The beach, the bars, and the streets are busy into the evening.",
  Berlin: "The days and the nights can both be full.",
  Majorca: "You can choose a quiet bay or a busier resort on the same island.",
  Crete: "The island is large enough for a beach week without one crowded strip.",
  Algarve: "The coast is a string of towns and beaches rather than one party resort.",
  Menorca: "It is the quieter Balearic, with coves instead of a club strip.",
  Corsica: "The coast is rugged and the towns are small.",
  Ibiza: "The island is built around beaches, music, and people.",
  "Ayia Napa": "The resort is young, loud, and concentrated in one place.",
  "Les Deux Alpes": "It is a high resort with a long season and a proper village.",
  "Val Thorens": "It is high, purpose-built, and lively after skiing.",
  Mayrhofen: "The town has bars and a busier après than a small Austrian village.",
  Lech: "It is a small, smart village rather than a big party resort.",
  Zermatt: "The village is car-free and the evenings are civilised.",
  Courchevel: "It is a polished resort, more hotel than nightclub.",
  Ischgl: "The après-ski is a reason people book it.",
  "Disneyland Paris": "The days are planned for you, which suits children and a booked week.",
  "Majorca family": "The island has hotels that are set up for children and a beach.",
  "Tenerife family": "The south has pools, water parks, and short transfers.",
  "Center Parcs": "The village is self-contained, so the days can stay on site.",
  Marrakech: "The medina is intense, social, and built around food.",
  Lyon: "It is a food city you can walk, without the crush of a capital.",
  "San Sebastian": "The pintxos bars are the point, and the city is compact.",
};

export type PlannedSearch = {
  place: string;
  query: string;
  why: string;
};

function placementBecause(brief: Brief): string {
  const pace =
    brief.pace === "slow" ? "slow days" : brief.pace === "full" ? "full days" : "a mixed pace";
  const company =
    brief.company === "quiet"
      ? "somewhere quiet"
      : brief.company === "lively"
        ? "somewhere lively"
        : "no strong preference about the crowd";
  const comfort =
    brief.comfort === "simple"
      ? "a simple room"
      : brief.comfort === "treat"
        ? "a treat of a hotel"
        : "an ordinary hotel";
  return `you asked for a ${styleLabel(brief.style)} holiday with ${pace}, ${company}, and ${comfort}`;
}

export function whyPlace(place: string, brief: Brief): string {
  const when = monthYear(brief.year, brief.month);
  const character =
    PLACE_CHARACTER[place] ??
    `It is one of the ${styleLabel(brief.style)} places that match those answers.`;
  const room =
    brief.comfort === "treat" ? "a luxury hotel" : brief.comfort === "simple" ? "a budget hotel" : "a hotel";
  return `${place} is on the list because ${placementBecause(brief)}. ${character} The prompt asks for a ${brief.nights}-night package from London in ${when}, with flights, ${room}, and a per-person price, so the fare can be tied to a listing.`;
}

export function plannedSearches(brief: Brief): PlannedSearch[] {
  const when = monthYear(brief.year, brief.month);
  const room =
    brief.comfort === "treat" ? "luxury hotel" : brief.comfort === "simple" ? "budget hotel" : "hotel";
  return placesFor(brief).map((place) => ({
    place,
    query: `${place} package holiday from London ${when} ${brief.nights} nights flights ${room} per person £`,
    why: whyPlace(place, brief),
  }));
}

export function personalityPortrait(brief: Brief): string {
  const pace =
    brief.pace === "slow"
      ? "slow days"
      : brief.pace === "full"
        ? "full days"
        : "a mix of rest and plans";
  const company =
    brief.company === "quiet"
      ? "a quiet stay"
      : brief.company === "lively"
        ? "people around"
        : "no strong feeling about the crowd";
  const comfort =
    brief.comfort === "simple"
      ? "a simple room"
      : brief.comfort === "treat"
        ? "a treat of a hotel"
        : "an ordinary comfortable room";
  const plan =
    brief.plan === "loose"
      ? "a loose plan"
      : brief.plan === "booked"
        ? "the days booked"
        : "a few plans and the rest free";
  return `You want ${pace}, ${company}, ${comfort}, and ${plan}.`;
}

export function searchQueries(brief: Brief): string[] {
  return plannedSearches(brief).map((search) => search.query);
}

export function isBrief(value: unknown): value is Brief {
  if (!value || typeof value !== "object") return false;
  const brief = value as Partial<Brief>;
  return (
    typeof brief.year === "number" &&
    typeof brief.month === "number" &&
    brief.month >= 1 &&
    brief.month <= 12 &&
    typeof brief.nights === "number" &&
    brief.nights >= 1 &&
    brief.nights <= 21 &&
    typeof brief.adults === "number" &&
    brief.adults >= 1 &&
    brief.adults <= 8 &&
    typeof brief.children === "number" &&
    brief.children >= 0 &&
    brief.children <= 6 &&
    typeof brief.budget === "number" &&
    brief.budget >= 50 &&
    brief.budget <= 20000 &&
    typeof brief.style === "string" &&
    STYLE_OPTIONS.some((option) => option.id === brief.style) &&
    PERSONALITY_QUESTIONS.every((question) =>
      question.options.some((option) => option.id === brief[question.id]),
    )
  );
}
