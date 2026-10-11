import type { Comfort, Company, Pace, Plan } from "@/lib/brief";

export type Setting = "sea" | "city" | "either";
export type Distance = "near" | "far" | "either";
export type Food = "central" | "incidental" | "either";
export type Morning = "late" | "early" | "either";

export type HolidayAnswers = {
  pace: Pace;
  company: Company;
  comfort: Comfort;
  plan: Plan;
  setting: Setting;
  distance: Distance;
  food: Food;
  morning: Morning;
  travellingFor: string;
  remember: string;
  avoid: string;
  loved: string;
};

export type PlacePick = {
  place: string;
  why: string;
};

type Flexible<T extends string> = T | "either";
type Tag = "sea" | "city" | "food" | "night" | "walk" | "villa" | "quiet" | "town" | "park";

type Place = {
  name: string;
  pace: Pace;
  company: Flexible<Company>;
  comfort: Flexible<Comfort>;
  plan: Flexible<Plan>;
  setting: Flexible<Setting>;
  distance: Flexible<Distance>;
  food: Flexible<Food>;
  morning: Flexible<Morning>;
  tags: Tag[];
  because: string;
};

type ChoiceId = "pace" | "company" | "comfort" | "plan" | "setting" | "distance" | "food" | "morning";
type OpenId = "travellingFor" | "remember" | "avoid" | "loved";

export type FlowQuestion =
  | {
      kind: "choice";
      id: ChoiceId;
      prompt: string;
      options: { id: string; label: string; hint: string }[];
    }
  | {
      kind: "open";
      id: OpenId;
      prompt: string;
      support: string;
      placeholder: string;
    };

export const FLOW: FlowQuestion[] = [
  {
    kind: "open",
    id: "travellingFor",
    prompt: "Who is this for?",
    support: "A sentence. The shortlist uses the words you write.",
    placeholder: "My sister and me, with time to talk",
  },
  {
    kind: "choice",
    id: "pace",
    prompt: "How do you want the days to feel?",
    options: [
      { id: "slow", label: "Slow", hint: "A book, a swim, nowhere to be" },
      { id: "mixed", label: "A bit of both", hint: "One outing, then nothing" },
      { id: "full", label: "Full", hint: "Out after breakfast" },
    ],
  },
  {
    kind: "open",
    id: "remember",
    prompt: "What do you want to remember?",
    support: "The thing you would tell someone afterwards.",
    placeholder: "A swim before anyone else is up",
  },
  {
    kind: "choice",
    id: "setting",
    prompt: "Where should you be?",
    options: [
      { id: "sea", label: "The sea", hint: "A coast, a swim, a horizon" },
      { id: "city", label: "A city", hint: "Streets, a room, a long lunch" },
      { id: "either", label: "Either", hint: "The days matter more than the map" },
    ],
  },
  {
    kind: "choice",
    id: "company",
    prompt: "Who else should be around?",
    options: [
      { id: "quiet", label: "Quiet", hint: "Your own terrace" },
      { id: "either", label: "Don't mind", hint: "Either is fine" },
      { id: "lively", label: "Lively", hint: "People, music, a bar" },
    ],
  },
  {
    kind: "open",
    id: "avoid",
    prompt: "What would ruin it?",
    support: "Name the thing you do not want. It pulls those places down.",
    placeholder: "Nightclubs, a schedule, a queue",
  },
  {
    kind: "choice",
    id: "comfort",
    prompt: "What should the room be?",
    options: [
      { id: "simple", label: "Simple", hint: "Clean, and the money spent elsewhere" },
      { id: "either", label: "Either", hint: "A decent bed is enough" },
      { id: "treat", label: "A treat", hint: "The good hotel" },
    ],
  },
  {
    kind: "choice",
    id: "food",
    prompt: "What about eating?",
    options: [
      { id: "central", label: "The point", hint: "The meals are why you go" },
      { id: "either", label: "Either", hint: "Good food is welcome" },
      { id: "incidental", label: "In passing", hint: "Eat, then get on with the day" },
    ],
  },
  {
    kind: "choice",
    id: "morning",
    prompt: "How does the morning start?",
    options: [
      { id: "late", label: "Late", hint: "Nothing before coffee" },
      { id: "either", label: "Either", hint: "Depends on the day" },
      { id: "early", label: "Early", hint: "Out while it is quiet" },
    ],
  },
  {
    kind: "choice",
    id: "distance",
    prompt: "How far from London?",
    options: [
      { id: "near", label: "Close", hint: "Europe, a few hours" },
      { id: "either", label: "Either", hint: "The place matters more" },
      { id: "far", label: "Far", hint: "A long journey is part of it" },
    ],
  },
  {
    kind: "choice",
    id: "plan",
    prompt: "How fixed is the plan?",
    options: [
      { id: "loose", label: "Loose", hint: "Decide on the day" },
      { id: "either", label: "Some of each", hint: "A few plans, then free" },
      { id: "booked", label: "Set", hint: "Know what is on" },
    ],
  },
  {
    kind: "open",
    id: "loved",
    prompt: "Name a place that already felt right.",
    support: "A city, a coast, or just the feeling. A name you write can join the shortlist.",
    placeholder: "A small harbour, or Lisbon in the morning",
  },
];

const PLACES: Place[] = [
  {
    name: "Crete",
    pace: "slow",
    company: "quiet",
    comfort: "simple",
    plan: "loose",
    setting: "sea",
    distance: "near",
    food: "incidental",
    morning: "late",
    tags: ["sea", "town", "walk", "quiet"],
    because: "The island is large, with beaches and small towns, and the nights stay quiet.",
  },
  {
    name: "Paphos",
    pace: "slow",
    company: "quiet",
    comfort: "simple",
    plan: "loose",
    setting: "sea",
    distance: "near",
    food: "incidental",
    morning: "late",
    tags: ["sea", "town", "quiet"],
    because: "It is a small harbour town, easy to keep unhurried.",
  },
  {
    name: "Madeira",
    pace: "slow",
    company: "quiet",
    comfort: "either",
    plan: "loose",
    setting: "either",
    distance: "near",
    food: "incidental",
    morning: "early",
    tags: ["walk", "town", "quiet"],
    because: "The island is walking, levadas, and a town, with evenings that stay small.",
  },
  {
    name: "Seville",
    pace: "slow",
    company: "quiet",
    comfort: "either",
    plan: "loose",
    setting: "city",
    distance: "near",
    food: "central",
    morning: "late",
    tags: ["city", "food", "town", "quiet"],
    because: "It is a smaller city, easy to keep to yourself between long lunches.",
  },
  {
    name: "Dubrovnik",
    pace: "slow",
    company: "quiet",
    comfort: "either",
    plan: "loose",
    setting: "sea",
    distance: "near",
    food: "incidental",
    morning: "early",
    tags: ["sea", "town", "walk", "quiet"],
    because: "The old town is compact, and the days can stay gentle.",
  },
  {
    name: "Maldives",
    pace: "slow",
    company: "quiet",
    comfort: "treat",
    plan: "loose",
    setting: "sea",
    distance: "far",
    food: "incidental",
    morning: "late",
    tags: ["sea", "villa", "quiet"],
    because: "The stay is the water and the villa, with very little else to arrange.",
  },
  {
    name: "Mauritius",
    pace: "slow",
    company: "quiet",
    comfort: "treat",
    plan: "either",
    setting: "sea",
    distance: "far",
    food: "incidental",
    morning: "late",
    tags: ["sea", "villa", "quiet"],
    because: "The coast is resort bays and long, quiet afternoons.",
  },
  {
    name: "Halkidiki",
    pace: "slow",
    company: "quiet",
    comfort: "treat",
    plan: "either",
    setting: "sea",
    distance: "near",
    food: "incidental",
    morning: "late",
    tags: ["sea", "quiet"],
    because: "It is a polished stretch of coast where the day can end early.",
  },
  {
    name: "Prague",
    pace: "mixed",
    company: "quiet",
    comfort: "either",
    plan: "loose",
    setting: "city",
    distance: "near",
    food: "incidental",
    morning: "either",
    tags: ["city", "walk", "town"],
    because: "The centre is compact, easy to wander and then stop.",
  },
  {
    name: "Bologna",
    pace: "mixed",
    company: "quiet",
    comfort: "either",
    plan: "loose",
    setting: "city",
    distance: "near",
    food: "central",
    morning: "late",
    tags: ["city", "food"],
    because: "It is a food city on a human scale, easy to wander and then stop.",
  },
  {
    name: "Porto",
    pace: "mixed",
    company: "quiet",
    comfort: "simple",
    plan: "loose",
    setting: "city",
    distance: "near",
    food: "central",
    morning: "either",
    tags: ["city", "food", "walk"],
    because: "The river and the tiled streets give you a city you can take slowly.",
  },
  {
    name: "Lisbon",
    pace: "mixed",
    company: "either",
    comfort: "either",
    plan: "loose",
    setting: "city",
    distance: "near",
    food: "central",
    morning: "either",
    tags: ["city", "food", "walk"],
    because: "The hills and the miradouros give you a city you can take slowly.",
  },
  {
    name: "Nice",
    pace: "mixed",
    company: "either",
    comfort: "treat",
    plan: "loose",
    setting: "sea",
    distance: "near",
    food: "central",
    morning: "late",
    tags: ["sea", "city", "food"],
    because: "The promenade and the old town leave the afternoon open.",
  },
  {
    name: "Corfu",
    pace: "mixed",
    company: "quiet",
    comfort: "treat",
    plan: "loose",
    setting: "sea",
    distance: "near",
    food: "incidental",
    morning: "late",
    tags: ["sea", "quiet"],
    because: "The bays are green and the evenings stay small.",
  },
  {
    name: "Barbados",
    pace: "mixed",
    company: "quiet",
    comfort: "treat",
    plan: "either",
    setting: "sea",
    distance: "far",
    food: "incidental",
    morning: "late",
    tags: ["sea", "villa", "quiet"],
    because: "The west coast is a long, polished beach rather than a loud strip.",
  },
  {
    name: "Paris",
    pace: "mixed",
    company: "either",
    comfort: "treat",
    plan: "either",
    setting: "city",
    distance: "near",
    food: "central",
    morning: "either",
    tags: ["city", "food", "walk"],
    because: "The city can be one outing and a long lunch, or a fuller day.",
  },
  {
    name: "Tenerife",
    pace: "mixed",
    company: "lively",
    comfort: "either",
    plan: "either",
    setting: "sea",
    distance: "near",
    food: "incidental",
    morning: "either",
    tags: ["sea", "night"],
    because: "The south has restaurants and people out in the evening, with room for a slower morning.",
  },
  {
    name: "Rome",
    pace: "full",
    company: "either",
    comfort: "treat",
    plan: "booked",
    setting: "city",
    distance: "near",
    food: "central",
    morning: "early",
    tags: ["city", "food", "walk"],
    because: "You can fill every day, and the city rewards a plan you already know.",
  },
  {
    name: "Orlando",
    pace: "full",
    company: "either",
    comfort: "either",
    plan: "booked",
    setting: "either",
    distance: "far",
    food: "incidental",
    morning: "early",
    tags: ["park"],
    because: "The days are laid out around the parks, which suits a fixed week.",
  },
  {
    name: "St Lucia",
    pace: "slow",
    company: "quiet",
    comfort: "treat",
    plan: "booked",
    setting: "sea",
    distance: "far",
    food: "incidental",
    morning: "late",
    tags: ["sea", "villa", "quiet"],
    because: "The pitons and the resort coast suit a stay that is already shaped.",
  },
  {
    name: "Dubai",
    pace: "full",
    company: "lively",
    comfort: "treat",
    plan: "either",
    setting: "city",
    distance: "far",
    food: "incidental",
    morning: "either",
    tags: ["city", "night"],
    because: "The hotels, the dining, and the scale of the evenings match a full, polished stay.",
  },
  {
    name: "Las Vegas",
    pace: "full",
    company: "lively",
    comfort: "treat",
    plan: "booked",
    setting: "city",
    distance: "far",
    food: "incidental",
    morning: "late",
    tags: ["city", "night"],
    because: "The strip keeps the days and the nights full, in one concentrated place.",
  },
  {
    name: "Cancun",
    pace: "full",
    company: "lively",
    comfort: "treat",
    plan: "either",
    setting: "sea",
    distance: "far",
    food: "incidental",
    morning: "late",
    tags: ["sea", "night"],
    because: "The hotel zone is built for long days and busy evenings.",
  },
  {
    name: "Barcelona",
    pace: "full",
    company: "lively",
    comfort: "either",
    plan: "either",
    setting: "either",
    distance: "near",
    food: "central",
    morning: "late",
    tags: ["sea", "city", "food", "night"],
    because: "The beach, the bars, and the streets stay busy into the evening.",
  },
  {
    name: "New York",
    pace: "full",
    company: "lively",
    comfort: "either",
    plan: "either",
    setting: "city",
    distance: "far",
    food: "incidental",
    morning: "early",
    tags: ["city", "night", "walk"],
    because: "The neighbourhoods stay busy from morning until late.",
  },
  {
    name: "Madrid",
    pace: "full",
    company: "lively",
    comfort: "either",
    plan: "either",
    setting: "city",
    distance: "near",
    food: "central",
    morning: "late",
    tags: ["city", "food", "night"],
    because: "The days run late, and the evenings are part of the city.",
  },
  {
    name: "Berlin",
    pace: "full",
    company: "lively",
    comfort: "simple",
    plan: "loose",
    setting: "city",
    distance: "near",
    food: "incidental",
    morning: "late",
    tags: ["city", "night", "walk"],
    because: "The days and the nights can both be full, without a formal setting.",
  },
];

const SYNONYMS: Record<Tag, string[]> = {
  sea: ["sea", "seas", "beach", "beaches", "swim", "swimming", "swims", "coast", "harbour", "harbor", "sand", "ocean", "cove", "coves"],
  city: ["city", "cities", "street", "streets", "museum", "museums", "urban"],
  food: ["food", "lunch", "lunches", "dinner", "restaurant", "restaurants", "wine", "meal", "meals"],
  night: ["nightclub", "nightclubs", "nightlife", "club", "clubs", "strip"],
  walk: ["walk", "walks", "walking", "hike", "hikes", "hiking", "levada", "levadas"],
  villa: ["villa", "villas", "pool"],
  quiet: ["quiet", "peaceful", "calm", "silence", "still"],
  town: ["town", "towns", "village", "villages", "harbour", "harbor"],
  park: ["park", "parks", "disney", "theme park"],
};

function axisScore<T extends string>(answer: T, place: Flexible<T>): number {
  if (answer === place) return 3;
  if (answer === "either" || place === "either") return 1;
  return -2;
}

function hasWord(text: string, word: string): boolean {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i").test(text);
}

function matchedTags(text: string, tags: Tag[]): Tag[] {
  return tags.filter((tag) => SYNONYMS[tag].some((word) => hasWord(text, word)));
}

function namesPlace(text: string, name: string): boolean {
  if (name === "Nice") return /\bNice\b/.test(text) || /^\s*nice\s*$/i.test(text);
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i").test(text);
}

function scorePlace(place: Place, answers: HolidayAnswers): number {
  const axes =
    axisScore(answers.pace, place.pace) +
    axisScore(answers.company, place.company) +
    axisScore(answers.comfort, place.comfort) +
    axisScore(answers.plan, place.plan) +
    axisScore(answers.setting, place.setting) +
    axisScore(answers.distance, place.distance) +
    axisScore(answers.food, place.food) +
    axisScore(answers.morning, place.morning);
  const wanted = `${answers.remember} ${answers.travellingFor} ${answers.loved}`;
  const tagBonus = Math.min(matchedTags(wanted, place.tags).length, 3) * 3;
  const named = namesPlace(answers.loved, place.name) ? 16 : 0;
  const tagPenalty = matchedTags(answers.avoid, place.tags).length * 20;
  const namedAvoid = namesPlace(answers.avoid, place.name) ? 20 : 0;
  return axes + tagBonus + named - tagPenalty - namedAvoid;
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

function settingPhrase(setting: Setting): string {
  if (setting === "sea") return "the sea";
  if (setting === "city") return "a city";
  return "no preference about sea or city";
}

function distancePhrase(distance: Distance): string {
  if (distance === "near") return "a short journey";
  if (distance === "far") return "a long journey";
  return "no preference about the distance";
}

function foodPhrase(food: Food): string {
  if (food === "central") return "meals as the point";
  if (food === "incidental") return "food in passing";
  return "no strong feeling about food";
}

function morningPhrase(morning: Morning): string {
  if (morning === "late") return "a late morning";
  if (morning === "early") return "an early start";
  return "no rule about the morning";
}

function wants(answers: HolidayAnswers): string {
  return `${pacePhrase(answers.pace)}, ${companyPhrase(answers.company)}, ${comfortPhrase(answers.comfort)}, and ${planPhrase(answers.plan)}. You also want ${settingPhrase(answers.setting)}, ${distancePhrase(answers.distance)}, ${foodPhrase(answers.food)}, and ${morningPhrase(answers.morning)}`;
}

export function personalityLine(answers: HolidayAnswers): string {
  return `You want ${wants(answers)}.`;
}

function quote(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim().slice(0, 90);
  return `“${clean}”`;
}

function whyFor(place: Place, answers: HolidayAnswers): string {
  const named = namesPlace(answers.loved, place.name);
  return [
    `${place.name}. ${place.because}`,
    `This is for ${quote(answers.travellingFor)}.`,
    `You wanted to remember ${quote(answers.remember)}.`,
    `You did not want ${quote(answers.avoid)}.`,
    named ? `You named ${place.name}.` : `You wrote ${quote(answers.loved)}.`,
  ].join(" ");
}

export function recommendFromPersonality(answers: HolidayAnswers): PlacePick[] {
  return PLACES.map((place, index) => ({ place, index, score: scorePlace(place, answers) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 3)
    .map(({ place }) => ({
      place: place.name,
      why: whyFor(place, answers),
    }));
}
