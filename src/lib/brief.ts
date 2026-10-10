export type TripStyle =
  | "winter-sun"
  | "city"
  | "beach"
  | "ski"
  | "family"
  | "food";

export type Brief = {
  year: number;
  month: number;
  nights: number;
  adults: number;
  children: number;
  budget: number;
  style: TripStyle;
};

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

export function searchQueries(brief: Brief): string[] {
  const when = monthYear(brief.year, brief.month);
  return STYLE_PLACES[brief.style].map(
    (place) =>
      `${place} ${brief.nights} nights holiday from London ${when} £ per person`,
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
    STYLE_OPTIONS.some((option) => option.id === brief.style)
  );
}
