import type { Comfort, Company, Pace, Plan } from "@/lib/brief";
import {
  PLACE_NAMES,
  personalityLine,
  type Distance,
  type Food,
  type HolidayAnswers,
  type Morning,
  type PlacePick,
  type Setting,
} from "@/lib/personality-places";

const PACES: Pace[] = ["slow", "mixed", "full"];
const COMPANIES: Company[] = ["quiet", "either", "lively"];
const COMFORTS: Comfort[] = ["simple", "either", "treat"];
const PLANS: Plan[] = ["loose", "either", "booked"];
const SETTINGS: Setting[] = ["sea", "city", "either"];
const DISTANCES: Distance[] = ["near", "far", "either"];
const FOODS: Food[] = ["central", "incidental", "either"];
const MORNINGS: Morning[] = ["late", "early", "either"];

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODELS = [
  "nvidia/nemotron-3-super-120b-a12b:free",
  "google/gemma-4-31b-it:free",
  "google/gemma-4-26b-a4b-it:free",
];

type ChatTurn = { role: "system" | "user"; content: string };

function oneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && allowed.includes(value as T);
}

function written(value: unknown): value is string {
  return typeof value === "string" && value.trim().length >= 8 && value.trim().length <= 400;
}

export function isHolidayAnswers(value: unknown): value is HolidayAnswers {
  if (!value || typeof value !== "object") return false;
  const body = value as Record<string, unknown>;
  return (
    oneOf(body.pace, PACES) &&
    oneOf(body.company, COMPANIES) &&
    oneOf(body.comfort, COMFORTS) &&
    oneOf(body.plan, PLANS) &&
    oneOf(body.setting, SETTINGS) &&
    oneOf(body.distance, DISTANCES) &&
    oneOf(body.food, FOODS) &&
    oneOf(body.morning, MORNINGS) &&
    written(body.travellingFor) &&
    written(body.remember) &&
    written(body.avoid) &&
    written(body.loved)
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function earliestName(
  text: string,
  from: number,
  allowed: readonly string[],
  seen: Set<string>,
): { name: string; index: number; length: number } | null {
  let best: { name: string; index: number; length: number } | null = null;
  for (const name of allowed) {
    if (seen.has(name)) continue;
    const pattern =
      name === "Nice" ? /\bNice\b/g : new RegExp(`\\b${escapeRegExp(name)}\\b`, "gi");
    pattern.lastIndex = from;
    const match = pattern.exec(text);
    if (!match || match.index < from) continue;
    if (
      !best ||
      match.index < best.index ||
      (match.index === best.index && name.length > best.name.length)
    ) {
      best = { name, index: match.index, length: match[0].length };
    }
  }
  return best;
}

function cleanWhy(raw: string): string {
  let text = raw.replace(/\*\*/g, "");
  const whyMark = text.search(/\bwhy\s*:/i);
  if (whyMark > 0) text = text.slice(whyMark);
  const nextItem = text.search(/\s+\d+\.\s*(?:place|name)\s*:/i);
  if (nextItem >= 0) text = text.slice(0, nextItem);
  text = text.replace(/\s+\d+\.\s*$/, "").replace(/\s*(?:place|name)\s*:\s*$/i, "");
  for (let pass = 0; pass < 2; pass += 1) {
    text = text.replace(/^[\s\d.)(:*,•\-–—]+/, "").replace(/^(?:why|reason)\s*:\s*/i, "");
  }
  const sentences = text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 8)
    .slice(0, 2)
    .filter((sentence) => !/^(?:place|name)\s*:?$/i.test(sentence))
    .filter((sentence) => !/[£€$]/.test(sentence))
    .filter((sentence) => !/\b(flight|flights|airfare|booking|booked)\b/i.test(sentence))
    .filter((sentence) => !/\bbook a\b/i.test(sentence));
  let why = sentences.join(" ").replace(/["“”]/g, "").trim();
  if (why.length > 420) why = why.slice(0, 420).replace(/\s+\S*$/, "").trim();
  if (why && !/[.!?]$/.test(why)) why += ".";
  return why;
}

function contentWords(answers: HolidayAnswers): string[] {
  const skip = new Set([
    "with",
    "from",
    "that",
    "this",
    "your",
    "have",
    "want",
    "been",
    "they",
    "them",
    "then",
    "into",
    "about",
    "after",
    "before",
    "would",
    "could",
    "there",
    "their",
    "where",
    "when",
    "what",
    "which",
    "while",
    "just",
    "like",
    "very",
    "more",
    "some",
    "only",
    "also",
  ]);
  const words = `${answers.travellingFor} ${answers.remember} ${answers.avoid} ${answers.loved}`.toLowerCase().match(/[a-z]{4,}/g) ?? [];
  return [...new Set(words.filter((word) => !skip.has(word)))].slice(0, 8);
}

function usesWords(picks: PlacePick[], words: string[]): boolean {
  if (words.length === 0) return true;
  const blob = picks.map((pick) => pick.why.toLowerCase()).join(" ");
  const needed = Math.min(2, words.length);
  return words.filter((word) => blob.includes(word)).length >= needed;
}

export function parseModelShortlist(text: string, allowed: readonly string[] = PLACE_NAMES): PlacePick[] | null {
  const source = text.replace(/```/g, "");
  const hits: { name: string; index: number; length: number }[] = [];
  const seen = new Set<string>();
  let cursor = 0;
  while (hits.length < 3) {
    const next = earliestName(source, cursor, allowed, seen);
    if (!next) break;
    hits.push(next);
    seen.add(next.name);
    cursor = next.index + next.length;
  }
  if (hits.length < 3) return null;
  const picks = hits.slice(0, 3).map((hit, index) => {
    const end = index + 1 < hits.length ? hits[index + 1].index : source.length;
    return { place: hit.name, why: cleanWhy(source.slice(hit.index + hit.length, end)) };
  });
  return acceptPicks(picks);
}

function acceptPicks(picks: PlacePick[]): PlacePick[] | null {
  if (picks.length < 3) return null;
  const three = picks.slice(0, 3);
  if (
    three.some(
      (pick) =>
        pick.why.length < 32 ||
        /^why\b/i.test(pick.why) ||
        /place:/i.test(pick.why) ||
        /\b(the|a|an|of|to|and|for)\.$/i.test(pick.why),
    )
  ) {
    return null;
  }
  if (new Set(three.map((pick) => pick.why)).size < 2) return null;
  if (three.some((pick) => /[£€$]/.test(pick.why) || /\bflight/i.test(pick.why) || /\b(booking|booked|book a)\b/i.test(pick.why))) {
    return null;
  }
  return three;
}

function canonicalPlace(name: string, allowed: readonly string[]): string | null {
  const trimmed = name.trim();
  return allowed.find((place) => place.toLowerCase() === trimmed.toLowerCase()) ?? null;
}

export function parseModelReply(text: string, allowed: readonly string[] = PLACE_NAMES): PlacePick[] | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return parseModelShortlist(text, allowed);
  try {
    const data = JSON.parse(text.slice(start, end + 1)) as { places?: unknown };
    if (!Array.isArray(data.places)) return parseModelShortlist(text, allowed);
    const seen = new Set<string>();
    const picks: PlacePick[] = [];
    for (const item of data.places) {
      if (!item || typeof item !== "object") continue;
      const record = item as { place?: unknown; why?: unknown };
      if (typeof record.place !== "string" || typeof record.why !== "string") continue;
      const place = canonicalPlace(record.place, allowed);
      if (!place || seen.has(place)) continue;
      seen.add(place);
      picks.push({ place, why: cleanWhy(record.why) });
      if (picks.length === 3) break;
    }
    return acceptPicks(picks) ?? parseModelShortlist(text, allowed);
  } catch {
    return parseModelShortlist(text, allowed);
  }
}

function messagesFor(answers: HolidayAnswers, extra: string): ChatTurn[] {
  const words = contentWords(answers);
  const system = [
    "Choose exactly three holiday places from the allowed list.",
    'Reply with JSON only: {"places":[{"place":"Name","why":"two sentences"}]}',
    "Copy each name from the allowed list. Each why must be different and must use the traveller's own words.",
    "Write the reasons as you, not as I.",
    "Do not mention prices, fares, flights, or booking.",
  ].join(" ");
  const user = [
    `Allowed places: ${PLACE_NAMES.join(", ")}.`,
    personalityLine(answers),
    `Travelling for: ${answers.travellingFor.trim()}`,
    `Remember: ${answers.remember.trim()}`,
    `Avoid: ${answers.avoid.trim()}`,
    `Already loved: ${answers.loved.trim()}`,
    words.length ? `Use these words in the reasons: ${words.join(", ")}.` : "",
    extra,
  ]
    .filter((line) => line !== "")
    .join("\n");
  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}

async function writeOnce(answers: HolidayAnswers, extra: string, model: string): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY?.trim();
  if (!key) throw new Error("The shortlist was not written.");
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "X-Title": "Halcyon",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 900,
      reasoning: { enabled: false },
      messages: messagesFor(answers, extra),
    }),
  });
  if (!response.ok) {
    console.error("OpenRouter request failed", model, response.status);
    throw new Error("The shortlist was not written.");
  }
  const body = (await response.json()) as {
    choices?: Array<{ message?: { content?: unknown; reasoning?: unknown } }>;
  };
  const message = body.choices?.[0]?.message;
  const content = typeof message?.content === "string" ? message.content.trim() : "";
  const reasoning = typeof message?.reasoning === "string" ? message.reasoning.trim() : "";
  const text = content || reasoning;
  if (!text) throw new Error("The shortlist was not written.");
  return text;
}

export async function generateShortlist(answers: HolidayAnswers): Promise<PlacePick[]> {
  const words = contentWords(answers);
  let fallback: PlacePick[] | null = null;
  for (const model of MODELS) {
    try {
      const picks = parseModelReply(await writeOnce(answers, "", model));
      if (picks && usesWords(picks, words)) return picks;
      if (picks) fallback = picks;
    } catch (error) {
      console.error("Shortlist model failed", model, error instanceof Error ? error.message : error);
    }
  }
  if (fallback) return fallback;
  throw new Error("The shortlist was not written.");
}
