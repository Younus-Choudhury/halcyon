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

export function personalityWords(brief: Brief): string {
  const words: string[] = [];
  if (brief.pace === "slow") words.push("relaxing");
  if (brief.pace === "full") words.push("busy");
  if (brief.company === "quiet") words.push("quiet");
  if (brief.company === "lively") words.push("lively");
  if (brief.comfort === "treat") words.push("luxury");
  if (brief.comfort === "simple") words.push("good value");
  if (brief.plan === "booked") words.push("itinerary");
  return words.slice(0, 2).join(" ");
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
  const when = monthYear(brief.year, brief.month);
  const tone = personalityWords(brief);
  const toneText = tone ? `${tone} ` : "";
  return placesFor(brief).map(
    (place) =>
      `${place} ${brief.nights} nights ${toneText}holiday from London ${when} £ per person`,
  );
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
