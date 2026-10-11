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

const MODEL = "onnx-community/Qwen2.5-1.5B-Instruct";

type ChatTurn = { role: "system" | "user"; content: string };
type Generated = string | Array<{ role?: string; content?: string }>;
type TextGenerator = (
  messages: ChatTurn[],
  options: {
    max_new_tokens: number;
    temperature: number;
    do_sample: boolean;
    repetition_penalty: number;
  },
) => Promise<Array<{ generated_text: Generated }>>;

let generatorPromise: Promise<TextGenerator> | null = null;

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
    .filter((sentence) => !/\b(flight|flights|airfare|booking)\b/i.test(sentence))
    .filter((sentence) => !/\bbook(?:ing|ed| a)?\b/i.test(sentence));
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
  if (
    picks.some(
      (pick) =>
        pick.why.length < 32 ||
        /^why\b/i.test(pick.why) ||
        /place:/i.test(pick.why) ||
        /\b(the|a|an|of|to|and|for)\.$/i.test(pick.why),
    )
  ) {
    return null;
  }
  if (new Set(picks.map((pick) => pick.why)).size < 2) return null;
  if (picks.some((pick) => /[£€$]/.test(pick.why) || /\bflight/i.test(pick.why) || /\bbook/i.test(pick.why))) {
    return null;
  }
  return picks;
}

function readGenerated(value: Generated | undefined): string {
  if (typeof value === "string") return value;
  if (!Array.isArray(value)) return "";
  const last = value.at(-1);
  return typeof last?.content === "string" ? last.content : "";
}

async function getGenerator(): Promise<TextGenerator> {
  if (!generatorPromise) {
    generatorPromise = import("@huggingface/transformers").then(async ({ pipeline }) => {
      const generator = await pipeline("text-generation", MODEL, { dtype: "q4" });
      return generator as unknown as TextGenerator;
    });
  }
  try {
    return await generatorPromise;
  } catch (error) {
    generatorPromise = null;
    throw error;
  }
}

function messagesFor(answers: HolidayAnswers, extra: string): ChatTurn[] {
  const words = contentWords(answers);
  const system = [
    "Write exactly three holiday places from the allowed list. Use this shape and nothing else:",
    "Place: Name",
    "Why: two sentences.",
    "Each why must be different and must use the traveller's words.",
    "Do not stop after one place. Do not mention prices, fares, flights, or booking.",
  ].join("\n");
  const user = [
    `Allowed places: ${PLACE_NAMES.join(", ")}.`,
    personalityLine(answers),
    `Travelling for: ${answers.travellingFor.trim()}`,
    `Remember: ${answers.remember.trim()}`,
    `Avoid: ${answers.avoid.trim()}`,
    `Already loved: ${answers.loved.trim()}`,
    words.length ? `Use these words in the reasons: ${words.join(", ")}.` : "",
    extra,
    "Write three places now.",
  ]
    .filter((line) => line !== "")
    .join("\n");
  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}

async function writeOnce(answers: HolidayAnswers, extra: string): Promise<string> {
  const generator = await getGenerator();
  const output = await generator(messagesFor(answers, extra), {
    max_new_tokens: 320,
    temperature: 0.35,
    do_sample: true,
    repetition_penalty: 1.12,
  });
  const text = readGenerated(output[0]?.generated_text);
  return text.trimStart().startsWith("Place:") ? text : `Place: ${text}`;
}

export async function generateShortlist(answers: HolidayAnswers): Promise<PlacePick[]> {
  const words = contentWords(answers);
  const reminder = `Use at least two of these words from the traveller, without quotation marks: ${words.join(", ")}. Reply again with exactly three Place and Why blocks.`;
  const first = parseModelShortlist(await writeOnce(answers, ""));
  if (first && usesWords(first, words)) return first;
  const second = parseModelShortlist(await writeOnce(answers, reminder));
  if (second && usesWords(second, words)) return second;
  if (second) return second;
  if (first) return first;
  throw new Error("The shortlist was not written.");
}
