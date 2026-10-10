import {
  holidays,
  STYLE_OPTIONS,
  type Departure,
  type Holiday,
  type TripStyle,
} from "@/data/holidays";

export type Brief = {
  year: number;
  month: number;
  nights: number;
  adults: number;
  children: number;
  budget: number;
  style: TripStyle;
};

export type PriceKind =
  | "exact"
  | "other-year"
  | "season"
  | "unpriced"
  | "undated";

export type Quote = {
  perAdult: number;
  perChild: number | null;
  partyTotal: number | null;
  partyNote: string;
  dateLabel: string;
  kind: PriceKind;
  yearInferred: boolean;
};

export type Recommendation = {
  holiday: Holiday;
  fit: "clean" | "close";
  quote: Quote;
  fitNote: string;
};

export type Shortlist = {
  intro: string;
  cleanCount: number;
  results: Recommendation[];
};

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

export function monthOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  let year = 2026;
  let month = 10;
  while (year < 2027 || (year === 2027 && month <= 12)) {
    options.push({
      value: `${year}-${month}`,
      label: `${MONTHS[month - 1]} ${year}`,
    });
    month += 1;
    if (month === 13) {
      month = 1;
      year += 1;
    }
  }
  return options;
}

export function styleLabel(style: TripStyle): string {
  return STYLE_OPTIONS.find((option) => option.id === style)?.label.toLowerCase() ?? style;
}

export function gbp(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function monthYear(year: number, month: number): string {
  return `${MONTHS[month - 1]} ${year}`;
}

function monthDistance(a: number, b: number): number {
  const raw = Math.abs(a - b);
  return Math.min(raw, 12 - raw);
}

function partyPhrase(brief: Brief): string {
  const adults = `${brief.adults} ${brief.adults === 1 ? "adult" : "adults"}`;
  if (brief.children === 0) return adults;
  const children = `${brief.children} ${brief.children === 1 ? "child" : "children"}`;
  return `${adults} and ${children}`;
}

function disneyAdultRate(sharers: number): number {
  if (sharers <= 1) return 1350;
  if (sharers === 2) return 815;
  if (sharers === 3) return 695;
  return 650;
}

function pickDeparture(holiday: Holiday, brief: Brief): {
  departure: Departure | null;
  kind: PriceKind;
} {
  const exact = holiday.departures.find(
    (departure) => departure.year === brief.year && departure.month === brief.month,
  );
  if (exact) return { departure: exact, kind: "exact" };

  const sameMonth = holiday.departures
    .filter((departure) => departure.month === brief.month)
    .sort((a, b) => Math.abs(a.year - brief.year) - Math.abs(b.year - brief.year))[0];
  if (sameMonth) return { departure: sameMonth, kind: "other-year" };

  if (holiday.departures.length === 0) return { departure: null, kind: "undated" };

  if (holiday.seasonMonths.includes(brief.month)) {
    return { departure: holiday.departures[0], kind: "season" };
  }

  const nearest = [...holiday.departures].sort(
    (a, b) => monthDistance(a.month, brief.month) - monthDistance(b.month, brief.month),
  )[0];
  return { departure: nearest, kind: "unpriced" };
}

export function quoteHoliday(holiday: Holiday, brief: Brief): Quote {
  const picked = pickDeparture(holiday, brief);
  const datedPrice = picked.departure?.price ?? holiday.undatedPrice ?? 0;
  const yearInferred = picked.departure?.yearInferred ?? false;
  const dateLabel =
    picked.departure?.label ??
    "the price on the listing, which did not print a travel date";

  if (holiday.id === "disneyland-hotel") {
    const sharers = brief.adults + brief.children;
    const perAdult = disneyAdultRate(sharers);
    const perChild = brief.children > 0 ? 400 : null;
    const partyTotal = perAdult * brief.adults + 400 * brief.children;
    const shareLabel =
      sharers <= 1
        ? "single room"
        : sharers === 2
          ? "two-person share"
          : sharers === 3
            ? "three-person share"
            : "four-person share";
    let partyNote = `COGO prices this room as a ${shareLabel}: £${perAdult.toLocaleString("en-GB")} an adult.`;
    if (brief.children > 0) {
      partyNote += ` Children are £400 each at the published 3–11 fare. Under-3s are free on the listing, and this total does not assume that.`;
    }
    if (sharers > 4) {
      partyNote += ` The page stops at a four-person share, so a party of ${sharers} may need another room.`;
    }
    partyNote += ` ${dateLabel}.`;
    return {
      perAdult,
      perChild,
      partyTotal,
      partyNote,
      dateLabel,
      kind: picked.kind,
      yearInferred,
    };
  }

  if (holiday.occupancy && holiday.occupancy !== brief.adults) {
    return {
      perAdult: datedPrice,
      perChild: null,
      partyTotal: null,
      partyNote: `Published at ${gbp(datedPrice)} a person for ${holiday.occupancy} adults. I have not scaled that to ${partyPhrase(brief)}. ${dateLabel}.`,
      dateLabel,
      kind: picked.kind,
      yearInferred,
    };
  }

  const partyTotal = datedPrice * brief.adults;
  let partyNote = `${gbp(partyTotal)} for ${brief.adults} ${brief.adults === 1 ? "adult" : "adults"} at the published rate.`;
  if (brief.children > 0) {
    partyNote += ` No child fare is printed on this listing, so the children are not in that total.`;
  }
  partyNote += ` ${dateLabel}.`;

  return {
    perAdult: datedPrice,
    perChild: null,
    partyTotal,
    partyNote,
    dateLabel,
    kind: picked.kind,
    yearInferred,
  };
}

function styleMatch(holiday: Holiday, brief: Brief): boolean {
  if (holiday.styles.includes(brief.style)) return true;
  return brief.style === "family" && holiday.familyFit === "great";
}

function scoreHoliday(holiday: Holiday, brief: Brief, quote: Quote): number {
  let score = 0;
  if (styleMatch(holiday, brief)) score += 40;

  if (quote.kind === "exact" && !quote.yearInferred) score += 34;
  else if (quote.kind === "exact") score += 18;
  else if (quote.kind === "other-year") score += 8;
  else if (quote.kind === "season") score += 12;
  else score -= 10;

  const nightGap = Math.abs(brief.nights - holiday.nights);
  if (nightGap === 0) score += 22;
  else if (nightGap <= 2) score += 12;
  else if (nightGap <= 4) score += 4;

  const ratio = quote.perAdult / brief.budget;
  if (ratio <= 1) score += 24;
  else if (ratio <= 1.15) score += 10;
  else if (ratio <= 1.4) score -= 6;
  else score -= 18;

  if ((brief.children > 0 || brief.style === "family") && holiday.familyFit === "great") {
    score += 16;
  }
  if (brief.children > 0 && holiday.familyFit === "poor") score -= 28;
  if (holiday.occupancy && holiday.occupancy !== brief.adults) score -= 12;

  return score;
}

function isClean(holiday: Holiday, brief: Brief, quote: Quote): boolean {
  if (!styleMatch(holiday, brief)) return false;
  if (quote.kind !== "exact" || quote.yearInferred) return false;
  if (quote.perAdult > brief.budget * 1.15) return false;
  if (Math.abs(brief.nights - holiday.nights) > 2) return false;
  if (brief.children > 0 && holiday.familyFit === "poor") return false;
  if (holiday.occupancy && holiday.occupancy !== brief.adults) return false;
  return true;
}

function fitNote(holiday: Holiday, brief: Brief, quote: Quote, fit: "clean" | "close"): string {
  const sentences: string[] = [];
  const wanted = styleLabel(brief.style);

  if (holiday.styles.includes(brief.style)) {
    sentences.push(
      fit === "clean"
        ? `This is a ${wanted} trip, which is what you asked for.`
        : `It is a ${wanted} trip, so the style is right.`,
    );
  } else if (brief.style === "family" && holiday.familyFit === "great") {
    sentences.push(
      "You asked for a family holiday, and this is one of the trips on the desk that is actually built for children.",
    );
  } else {
    const filed = holiday.styles.map((style) => styleLabel(style)).join(" and ");
    sentences.push(
      `You asked for ${wanted}. This one is filed under ${filed}, so it is a sideways match.`,
    );
  }

  const when = monthYear(brief.year, brief.month);
  if (quote.kind === "exact" && quote.yearInferred) {
    sentences.push(
      `The listing prints ${quote.dateLabel.replace(".", "")}, without a year. I am reading that as ${when}.`,
    );
  } else if (quote.kind === "exact") {
    sentences.push(`The fare I am using is published for ${when}.`);
  } else if (quote.kind === "other-year") {
    sentences.push(
      `There is a ${MONTHS[brief.month - 1]} fare, but it is ${quote.dateLabel}, not ${when}.`,
    );
  } else if (quote.kind === "season") {
    sentences.push(
      `${holiday.destination} still makes sense in ${when}, but this price belongs to ${quote.dateLabel}.`,
    );
  } else if (quote.kind === "undated") {
    sentences.push(
      `The listing did not print a travel date, so I cannot tie ${gbp(quote.perAdult)} to ${when}.`,
    );
  } else {
    sentences.push(
      `Nothing is published for ${when}. The figure on the card is the nearest fare on the listing: ${quote.dateLabel}.`,
    );
  }

  const over = quote.perAdult - brief.budget;
  if (over <= 0) {
    sentences.push(
      `${gbp(quote.perAdult)} a person sits inside the ${gbp(brief.budget)} you set.`,
    );
  } else if (over <= brief.budget * 0.15) {
    sentences.push(
      `It is ${gbp(over)} a person over your ${gbp(brief.budget)}, close enough that I would still show it.`,
    );
  } else {
    sentences.push(
      `It is ${gbp(over)} a person over the ${gbp(brief.budget)} you set.`,
    );
  }

  if (brief.nights !== holiday.nights) {
    sentences.push(
      `You asked for ${brief.nights} nights. This listing is ${holiday.nights}.`,
    );
  }

  if (brief.children > 0 && holiday.familyFit === "poor") {
    sentences.push("I would not take children on this one. The hotel is built for adults.");
  } else if (brief.children > 0 && holiday.familyFit === "great") {
    sentences.push("It is set up for children, which matches your party.");
  }

  if (holiday.occupancy && holiday.occupancy !== brief.adults) {
    sentences.push(
      `The fare is published for ${holiday.occupancy} adults, and you are ${brief.adults}.`,
    );
  }

  if (brief.year === 2026 && brief.month === 10) {
    sentences.push(
      "October 2026 is already underway, so ask the operator what is still on sale.",
    );
  }

  return sentences.join(" ");
}

function pickThree<T extends { holiday: Holiday; score: number }>(scored: T[]): T[] {
  const sorted = [...scored].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.holiday.destination.localeCompare(b.holiday.destination);
  });
  const topScore = sorted[2]?.score ?? sorted[sorted.length - 1].score;
  const picked: typeof scored = [];

  for (const item of sorted) {
    if (picked.length === 3) break;
    const duplicate = picked.some((choice) => choice.holiday.placeKey === item.holiday.placeKey);
    if (duplicate) {
      const leader = picked.find((choice) => choice.holiday.placeKey === item.holiday.placeKey);
      const closeToLeader = leader !== undefined && leader.score - item.score <= 12;
      const wouldHaveBeenTopThree = item.score >= topScore;
      if (!(closeToLeader && wouldHaveBeenTopThree)) continue;
    }
    picked.push(item);
  }

  for (const item of sorted) {
    if (picked.length === 3) break;
    if (!picked.includes(item)) picked.push(item);
  }

  return picked;
}

export function recommend(brief: Brief): Shortlist {
  const scored = holidays.map((holiday) => {
    const quote = quoteHoliday(holiday, brief);
    return { holiday, quote, score: scoreHoliday(holiday, brief, quote) };
  });

  const picked = pickThree(scored);
  const results: Recommendation[] = picked.map((item) => {
    const fit = isClean(item.holiday, brief, item.quote) ? "clean" : "close";
    return {
      holiday: item.holiday,
      fit,
      quote: item.quote,
      fitNote: fitNote(item.holiday, brief, item.quote, fit),
    };
  });

  const cleanCount = results.filter((result) => result.fit === "clean").length;
  const request = `a ${styleLabel(brief.style)} trip in ${monthYear(brief.year, brief.month)} for ${partyPhrase(brief)}, about ${brief.nights} nights, up to ${gbp(brief.budget)} a person, from London`;

  let intro: string;
  if (cleanCount === 0) {
    intro = `Nothing on the desk is a clean match for ${request}. These three are the nearest, and each note says what is off.`;
  } else if (cleanCount === 3) {
    intro = `Three holidays for ${request}.`;
  } else if (cleanCount === 1) {
    intro = `One of these is a clean match for ${request}. The other cards are the next best on the desk, and they say where they fall short.`;
  } else {
    intro = `Two of these fit ${request}. The other card is the next best on the desk, and it says where it falls short.`;
  }

  return { intro, cleanCount, results };
}
