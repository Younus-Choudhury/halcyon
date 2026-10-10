"use client";

import { useEffect, useRef, useState } from "react";
import { HolidayCard } from "@/components/holiday-card";
import {
  gbp,
  monthOptions,
  monthYear,
  PERSONALITY_QUESTIONS,
  personalityPortrait,
  plannedSearches,
  STYLE_OPTIONS,
  type Brief,
  type TripStyle,
} from "@/lib/brief";
import type { Shortlist } from "@/lib/rank";
import { Check, ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";

const MONTHS = monthOptions();
const NIGHTS: { nights: number; hint: string }[] = [
  { nights: 2, hint: "A weekend" },
  { nights: 3, hint: "A long weekend" },
  { nights: 4, hint: "A short break" },
  { nights: 5, hint: "Most of a week" },
  { nights: 7, hint: "A full week" },
  { nights: 10, hint: "A long stay" },
  { nights: 14, hint: "Two weeks" },
];
const BUDGETS = [500, 800, 1200, 1800];

const QUESTION_STEPS = [
  "when",
  "nights",
  "party",
  "budget",
  "style",
  "pace",
  "company",
  "comfort",
  "plan",
] as const;

const STEPS = ["cover", ...QUESTION_STEPS, "review"] as const;

type QuestionStep = (typeof QUESTION_STEPS)[number];
type StepId = (typeof STEPS)[number];
type Phase = "flow" | "searching" | "results" | "failed";
type PersonalityId = "pace" | "company" | "comfort" | "plan";

const INITIAL_BRIEF: Brief = {
  year: 2027,
  month: 2,
  nights: 7,
  adults: 2,
  children: 0,
  budget: 800,
  style: "winter-sun",
  pace: null,
  company: null,
  comfort: null,
  plan: null,
};

type Choice = {
  id: string;
  label: string;
  hint?: string;
  selected: boolean;
  next: Brief;
};

function isQuestion(step: StepId): step is QuestionStep {
  return (QUESTION_STEPS as readonly string[]).includes(step);
}

function isPersonality(step: StepId): step is PersonalityId {
  return step === "pace" || step === "company" || step === "comfort" || step === "plan";
}

function progressFor(step: StepId): number {
  if (step === "cover") return 0;
  if (step === "review") return 1;
  const index = QUESTION_STEPS.indexOf(step as QuestionStep);
  return (index + 1) / QUESTION_STEPS.length;
}

function partyLine(brief: Brief): string {
  const adults = `${brief.adults} ${brief.adults === 1 ? "adult" : "adults"}`;
  if (!brief.children) return adults;
  const children = `${brief.children} ${brief.children === 1 ? "child" : "children"}`;
  return `${adults}, ${children}`;
}

function ready(step: StepId, brief: Brief): boolean {
  if (step === "budget") return brief.budget >= 50;
  if (step === "party") return brief.adults >= 1;
  if (isPersonality(step)) return brief[step] !== null;
  return true;
}

function letter(index: number): string {
  return String.fromCharCode(65 + index);
}

export function Desk() {
  const [brief, setBrief] = useState<Brief>(INITIAL_BRIEF);
  const [step, setStep] = useState<StepId>("cover");
  const [phase, setPhase] = useState<Phase>("flow");
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [shortlist, setShortlist] = useState<Shortlist | null>(null);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const advanceTimer = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const returnToRef = useRef<StepId | null>(null);
  const stepRef = useRef(step);
  const briefRef = useRef(brief);
  const phaseRef = useRef(phase);

  function cancelAdvance() {
    if (advanceTimer.current) {
      window.clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
  }

  function scheduleAdvance(from: StepId) {
    cancelAdvance();
    advanceTimer.current = window.setTimeout(() => {
      advanceTimer.current = null;
      if (stepRef.current !== from) return;
      if (returnToRef.current) {
        const dest = returnToRef.current;
        returnToRef.current = null;
        setDirection("forward");
        setStep(dest);
        return;
      }
      const index = STEPS.indexOf(from);
      setDirection("forward");
      setStep(STEPS[Math.min(index + 1, STEPS.length - 1)]);
    }, 240);
  }

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: 0 });
    headingRef.current?.focus({ preventScroll: true });
  }, [step, phase]);

  useEffect(() => {
    return () => {
      cancelAdvance();
    };
  }, []);

  function choicesFor(current: Brief, currentStep: StepId): Choice[] | null {
    if (currentStep === "when") {
      return MONTHS.map((month) => {
        const [year, monthNumber] = month.value.split("-").map(Number);
        return {
          id: month.value,
          label: month.label,
          selected: current.year === year && current.month === monthNumber,
          next: { ...current, year, month: monthNumber },
        };
      });
    }
    if (currentStep === "nights") {
      return NIGHTS.map((option) => ({
        id: String(option.nights),
        label: `${option.nights} nights`,
        hint: option.hint,
        selected: current.nights === option.nights,
        next: { ...current, nights: option.nights },
      }));
    }
    if (currentStep === "style") {
      return STYLE_OPTIONS.map((option) => ({
        id: option.id,
        label: option.label,
        hint: option.hint,
        selected: current.style === option.id,
        next: { ...current, style: option.id as TripStyle },
      }));
    }
    if (isPersonality(currentStep)) {
      const question = PERSONALITY_QUESTIONS.find((item) => item.id === currentStep);
      if (!question) return null;
      return question.options.map((option) => ({
        id: option.id,
        label: option.label,
        hint: option.hint,
        selected: current[currentStep] === option.id,
        next: { ...current, [currentStep]: option.id },
      }));
    }
    return null;
  }

  function choose(next: Brief) {
    const from = stepRef.current;
    setBrief(next);
    setBudgetError(null);
    scheduleAdvance(from);
  }

  function goForward() {
    cancelAdvance();
    const currentStep = stepRef.current;
    const current = briefRef.current;
    if (phaseRef.current !== "flow") return;
    if (!ready(currentStep, current)) {
      if (currentStep === "budget") setBudgetError("Enter at least £50 a person.");
      return;
    }
    if (returnToRef.current) {
      const dest = returnToRef.current;
      returnToRef.current = null;
      setDirection("forward");
      setStep(dest);
      return;
    }
    const index = STEPS.indexOf(currentStep);
    if (index >= STEPS.length - 1) return;
    setDirection("forward");
    setStep(STEPS[index + 1]);
  }

  function goBack() {
    cancelAdvance();
    if (phaseRef.current === "searching") {
      abortRef.current?.abort();
      setPhase("flow");
      setDirection("back");
      return;
    }
    if (phaseRef.current === "results" || phaseRef.current === "failed") {
      returnToRef.current = null;
      setPhase("flow");
      setDirection("back");
      return;
    }
    if (returnToRef.current) {
      const dest = returnToRef.current;
      returnToRef.current = null;
      setDirection("back");
      setStep(dest);
      return;
    }
    const index = STEPS.indexOf(stepRef.current);
    if (index <= 0) return;
    setDirection("back");
    setStep(STEPS[index - 1]);
  }

  function jump(target: StepId) {
    cancelAdvance();
    returnToRef.current = "review";
    setPhase("flow");
    setDirection("back");
    setStep(target);
  }

  async function submit(current: Brief) {
    if (current.budget < 50) {
      setBudgetError("Enter at least £50 a person.");
      setPhase("flow");
      setDirection("back");
      setStep("budget");
      return;
    }
    if (current.adults < 1) {
      setPhase("flow");
      setDirection("back");
      setStep("party");
      return;
    }
    const missing = PERSONALITY_QUESTIONS.find((question) => !current[question.id]);
    if (missing) {
      setPhase("flow");
      setDirection("back");
      setStep(missing.id);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setSearchError(null);
    setShortlist(null);
    setDirection("forward");
    setPhase("searching");

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(current),
        cache: "no-store",
        signal: controller.signal,
      });
      const payload = (await response.json()) as Shortlist & { error?: string };
      if (controller.signal.aborted) return;
      if (!response.ok) throw new Error(payload.error || "The search failed.");
      setShortlist(payload);
      setPhase("results");
    } catch (caught) {
      if (controller.signal.aborted) return;
      if (caught instanceof Error && caught.name === "AbortError") return;
      setSearchError(caught instanceof Error ? caught.message : "The search failed.");
      setPhase("failed");
    }
  }

  useEffect(() => {
    stepRef.current = step;
    briefRef.current = brief;
    phaseRef.current = phase;
  }, [step, brief, phase]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "Enter") {
        const target = event.target as HTMLElement | null;
        if (target?.closest("a, button, input, textarea")) return;
        event.preventDefault();
        if (phase === "results" || phase === "searching") return;
        if (phase === "failed" || step === "review") {
          void submit(brief);
          return;
        }
        goForward();
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        goBack();
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (phase !== "flow") return;
      const alpha = event.key.toLowerCase();
      if (alpha.length !== 1 || alpha < "a" || alpha > "z") return;
      const options = choicesFor(brief, step);
      const choice = options?.[alpha.charCodeAt(0) - 97];
      if (!choice) return;
      choose(choice.next);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const choices = phase === "flow" ? choicesFor(brief, step) : null;
  const plans = plannedSearches(brief);
  const showProgress = !(phase === "flow" && step === "cover");
  const progress = phase === "flow" ? progressFor(step) : 1;
  const questionIndex = isQuestion(step) ? QUESTION_STEPS.indexOf(step) + 1 : null;
  const canGoBack = phase !== "flow" || step !== "cover";

  const prompt = screenPrompt(step, phase);
  const support = screenSupport(step, phase);
  const continueLabel =
    phase === "failed" || phase === "results"
      ? "Search again"
      : step === "cover"
        ? "Start"
        : step === "review"
          ? "Look up prices"
          : "Continue";

  const centered =
    phase === "flow" &&
    (step === "cover" || step === "party" || step === "budget" || isPersonality(step));
  const showFooter = phase !== "searching";
  const footerDisabled =
    phase === "flow" && step !== "cover" && step !== "review" && !ready(step, brief);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="z-10 shrink-0 px-4 pt-[max(0.7rem,env(safe-area-inset-top))] sm:pt-12">
        <div className="grid grid-cols-[5.2rem_minmax(0,1fr)_5.2rem] items-center">
          {canGoBack ? (
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-0.5 justify-self-start text-[15px] font-medium text-primary active:opacity-60"
            >
              <ChevronLeft className="size-5" aria-hidden />
              Back
            </button>
          ) : (
            <span />
          )}
          <p className="truncate text-center text-[13px] font-semibold tracking-[0.08em] text-foreground/80">
            {phase === "results" ? "Shortlist" : phase === "searching" ? "Searching" : "Halcyon"}
          </p>
          <p className="justify-self-end text-[13px] font-medium text-muted-foreground tabular-nums">
            {phase === "flow" && questionIndex ? `${questionIndex} / 8` : ""}
          </p>
        </div>
        <div
          className={`mt-3 h-1 overflow-hidden rounded-full bg-black/10 ${showProgress ? "" : "invisible"}`}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          aria-label="Questions answered"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </header>

      <div ref={scrollerRef} className="min-h-0 flex-1 overflow-y-auto">
        <div
          key={`${phase}-${step}`}
          className={`px-5 py-6 ${centered ? "flex min-h-full flex-col justify-center" : ""} ${
            direction === "back" ? "step-back" : "step-forward"
          }`}
        >
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="font-heading text-[2rem] leading-[1.12] font-medium tracking-tight text-balance text-[oklch(0.2_0.02_55)] outline-none"
          >
            {prompt}
          </h1>
          {support ? (
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{support}</p>
          ) : null}

          {phase === "flow" && step === "cover" ? <CoverNotes /> : null}

          {choices ? (
            <div className="mt-7 flex flex-col gap-2.5" role="radiogroup" aria-label={prompt}>
              {choices.map((choice, index) => (
                <button
                  key={choice.id}
                  type="button"
                  role="radio"
                  aria-checked={choice.selected}
                  onClick={() => choose(choice.next)}
                  className={`flex w-full items-center gap-3 rounded-[1.15rem] px-3.5 py-3.5 text-left transition-[transform,background-color,color,box-shadow] duration-200 active:scale-[0.985] ${
                    choice.selected
                      ? "bg-primary text-primary-foreground shadow-[0_10px_28px_oklch(0.38_0.055_175_/_0.28)]"
                      : "bg-white text-foreground shadow-[0_1px_0_oklch(0.2_0.02_60_/_0.04),0_10px_28px_oklch(0.3_0.02_60_/_0.06)]"
                  }`}
                >
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-[0.55rem] text-[12px] font-semibold ${
                      choice.selected ? "bg-white/18" : "bg-foreground/[0.06] text-foreground/70"
                    }`}
                  >
                    {letter(index)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[16px] leading-tight font-medium">{choice.label}</span>
                    {choice.hint ? (
                      <span
                        className={`mt-0.5 block text-[13px] leading-snug ${
                          choice.selected ? "text-primary-foreground/75" : "text-muted-foreground"
                        }`}
                      >
                        {choice.hint}
                      </span>
                    ) : null}
                  </span>
                  {choice.selected ? <Check className="size-4 shrink-0" aria-hidden /> : null}
                </button>
              ))}
            </div>
          ) : null}

          {phase === "flow" && step === "party" ? (
            <div className="mt-7 overflow-hidden rounded-[1.15rem] bg-white shadow-[0_1px_0_oklch(0.2_0.02_60_/_0.04),0_10px_28px_oklch(0.3_0.02_60_/_0.06)]">
              <Stepper
                label="Adults"
                value={brief.adults}
                min={1}
                max={6}
                onChange={(adults) => setBrief({ ...brief, adults })}
              />
              <div className="mx-4 h-px bg-foreground/10" />
              <Stepper
                label="Children"
                value={brief.children}
                min={0}
                max={4}
                onChange={(children) => setBrief({ ...brief, children })}
              />
            </div>
          ) : null}

          {phase === "flow" && step === "budget" ? (
            <div className="mt-8">
              <label className="flex items-baseline justify-center gap-1" htmlFor="budget">
                <span className="font-heading text-[2rem] text-muted-foreground">£</span>
                <input
                  id="budget"
                  inputMode="numeric"
                  autoComplete="off"
                  aria-invalid={budgetError ? true : undefined}
                  aria-describedby={budgetError ? "budget-error" : undefined}
                  className="w-36 bg-transparent text-center font-heading text-[3.4rem] tracking-tight outline-none"
                  value={brief.budget ? String(brief.budget) : ""}
                  onChange={(event) => {
                    const next = event.target.value.replace(/[^\d]/g, "");
                    setBudgetError(null);
                    setBrief({ ...brief, budget: next ? Number(next) : 0 });
                  }}
                />
              </label>
              <p className="mt-1 text-center text-[13px] text-muted-foreground">a person</p>
              {budgetError ? (
                <p id="budget-error" role="alert" className="mt-3 text-center text-[14px] text-destructive">
                  {budgetError}
                </p>
              ) : null}
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {BUDGETS.map((amount) => {
                  const selected = brief.budget === amount;
                  return (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => {
                        setBudgetError(null);
                        setBrief({ ...brief, budget: amount });
                      }}
                      className={`rounded-full px-3.5 py-2 text-[14px] font-medium transition-colors ${
                        selected
                          ? "bg-primary text-primary-foreground"
                          : "bg-white text-foreground shadow-[0_6px_16px_oklch(0.3_0.02_60_/_0.06)]"
                      }`}
                    >
                      {gbp(amount)}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {phase === "flow" && step === "review" ? (
            <Review
              brief={brief}
              onJump={jump}
              plans={plans}
            />
          ) : null}

          {phase === "searching" ? (
            <ul className="mt-7 flex flex-col gap-3">
              {plans.map((plan, index) => (
                <li
                  key={plan.query}
                  className="rounded-[1.15rem] bg-white px-4 py-3.5 shadow-[0_1px_0_oklch(0.2_0.02_60_/_0.04),0_10px_28px_oklch(0.3_0.02_60_/_0.06)]"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="search-dot size-2 shrink-0 rounded-full bg-primary"
                      style={{ animationDelay: `${index * 160}ms` }}
                    />
                    <p className="text-[16px] font-medium">{plan.place}</p>
                  </div>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{plan.why}</p>
                  <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                    <span className="font-semibold tracking-[0.12em] uppercase">Prompt </span>
                    {plan.query}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}

          {phase === "failed" ? (
            <p className="mt-6 rounded-[1.15rem] bg-mark/10 px-4 py-4 text-[15px] leading-relaxed">{searchError}</p>
          ) : null}

          {phase === "results" && shortlist ? (
            <div className="mt-6 flex flex-col gap-3">
              <div
                className={`rounded-[1.15rem] px-4 py-4 ${
                  shortlist.cleanCount === 0 ? "bg-mark/10" : "bg-primary/10"
                }`}
              >
                <p className="text-[15px] leading-relaxed">{shortlist.intro}</p>
                <p className="mt-2 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  Searched {shortlist.searchedAt}
                </p>
              </div>
              {shortlist.results.length === 0 ? (
                <p className="rounded-[1.15rem] bg-white px-4 py-4 text-[15px] leading-relaxed shadow-[0_10px_28px_oklch(0.3_0.02_60_/_0.06)]">
                  No dated fare came back. Change the month or the budget, then search again.
                </p>
              ) : (
                shortlist.results.map((result, index) => (
                  <HolidayCard
                    key={result.id}
                    result={result}
                    rank={index + 1}
                    searchedAt={shortlist.searchedAt}
                  />
                ))
              )}
            </div>
          ) : null}
        </div>
      </div>

      {showFooter ? (
        <div className="shrink-0 border-t border-black/5 bg-white/75 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl">
          <button
            type="button"
            disabled={footerDisabled}
            onClick={() => {
              if (phase === "results" || phase === "failed" || (phase === "flow" && step === "review")) {
                void submit(brief);
                return;
              }
              goForward();
            }}
            className="flex h-12 w-full items-center justify-center rounded-2xl bg-primary text-[16px] font-semibold text-primary-foreground shadow-[0_8px_20px_oklch(0.38_0.055_175_/_0.25)] transition-transform active:scale-[0.99] disabled:opacity-40"
          >
            {continueLabel}
          </button>
          {phase === "results" ? null : (
            <p className="mt-2 hidden text-center text-[11px] tracking-wide text-muted-foreground sm:block">
              {choices ? "A to choose  ·  Enter to continue" : "Enter to continue"}
            </p>
          )}
        </div>
      ) : (
        <div className="shrink-0 px-5 pt-2 pb-[max(0.9rem,env(safe-area-inset-bottom))] text-center text-[12px] text-muted-foreground">
          Each place is a new search. Earlier fares are not reused.
        </div>
      )}
    </div>
  );
}

function screenPrompt(step: StepId, phase: Phase): string {
  if (phase === "searching") return "Looking up current prices.";
  if (phase === "failed") return "The search did not finish.";
  if (phase === "results") return "Your shortlist.";
  if (step === "cover") return "A holiday from London.";
  if (step === "when") return "When do you want to leave?";
  if (step === "nights") return "How many nights?";
  if (step === "party") return "Who is coming?";
  if (step === "budget") return "What can you spend?";
  if (step === "style") return "What kind of holiday?";
  if (step === "review") return "Ready to look.";
  const question = PERSONALITY_QUESTIONS.find((item) => item.id === step);
  return question?.prompt ?? "";
}

function screenSupport(step: StepId, phase: Phase): string | null {
  if (phase === "searching") {
    return "Three searches are running for this brief. The place, the reason, and the prompt are under each name.";
  }
  if (phase === "failed") return "Nothing was saved from this attempt. You can try the same brief again.";
  if (phase === "results") return null;
  if (step === "cover") {
    return "Eight questions. Then three places, each with a fare read from a listing at the moment you ask.";
  }
  if (step === "when") return "London departures. The search looks for prices in that month.";
  if (step === "nights") return "A week is the usual length. A city break can be shorter.";
  if (step === "party") return "Fares are read per person. The party total is shown on each result.";
  if (step === "budget") return "Per person, for flights and a hotel. Under £50 is too little to judge a fare.";
  if (step === "style") return "This chooses the places that get searched.";
  if (step === "review") return "Tap a row to change an answer. The three searches are listed under the brief.";
  if (isPersonality(step)) return "This answer changes which places are searched.";
  return null;
}

function CoverNotes() {
  const notes = [
    ["01", "One question on screen"],
    ["02", "Places picked from how you travel"],
    ["03", "A fare, a reason, and the source link"],
  ];
  return (
    <ul className="mt-8 overflow-hidden rounded-[1.15rem] bg-white shadow-[0_1px_0_oklch(0.2_0.02_60_/_0.04),0_10px_28px_oklch(0.3_0.02_60_/_0.06)]">
      {notes.map(([index, line], noteIndex) => (
        <li
          key={index}
          className={`flex items-center gap-3 px-4 py-3.5 ${noteIndex < notes.length - 1 ? "border-b border-foreground/8" : ""}`}
        >
          <span className="w-7 font-heading text-[15px] text-primary">{index}</span>
          <span className="text-[15px]">{line}</span>
        </li>
      ))}
    </ul>
  );
}

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <p className="text-[16px] font-medium">{label}</p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`Fewer ${label.toLowerCase()}`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className="flex size-11 items-center justify-center rounded-full bg-black/10 disabled:opacity-30"
        >
          <Minus className="size-4" aria-hidden />
        </button>
        <span className="w-6 text-center font-heading text-[1.6rem] tabular-nums">{value}</span>
        <button
          type="button"
          aria-label={`More ${label.toLowerCase()}`}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-30"
        >
          <Plus className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

function Review({
  brief,
  onJump,
  plans,
}: {
  brief: Brief;
  onJump: (step: StepId) => void;
  plans: { place: string; why: string; query: string }[];
}) {
  const rows: { step: StepId; label: string; value: string }[] = [
    { step: "when", label: "When", value: monthYear(brief.year, brief.month) },
    { step: "nights", label: "Nights", value: `${brief.nights} nights` },
    { step: "party", label: "Party", value: partyLine(brief) },
    { step: "budget", label: "Budget", value: `${gbp(brief.budget)} a person` },
    {
      step: "style",
      label: "Style",
      value: STYLE_OPTIONS.find((option) => option.id === brief.style)?.label ?? "",
    },
    ...PERSONALITY_QUESTIONS.map((question) => ({
      step: question.id as StepId,
      label:
        question.id === "pace"
          ? "Days"
          : question.id === "company"
            ? "Company"
            : question.id === "comfort"
              ? "Room"
              : "Plan",
      value: question.options.find((option) => option.id === brief[question.id])?.label ?? "Not answered",
    })),
  ];

  return (
    <div className="mt-6">
      <p className="text-[15px] leading-relaxed text-muted-foreground">{personalityPortrait(brief)}</p>
      <p className="mt-6 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        What will be searched
      </p>
      <ul className="mt-3 flex flex-col gap-3">
        {plans.map((plan) => (
          <li key={plan.place} className="rounded-[1.15rem] bg-white px-4 py-3.5 shadow-[0_8px_22px_oklch(0.3_0.02_60_/_0.05)]">
            <p className="text-[16px] font-medium">{plan.place}</p>
            <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">{plan.why}</p>
            <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
              <span className="font-semibold tracking-[0.12em] uppercase">Prompt </span>
              {plan.query}
            </p>
          </li>
        ))}
      </ul>
      <div className="mt-5 overflow-hidden rounded-[1.15rem] bg-white shadow-[0_1px_0_oklch(0.2_0.02_60_/_0.04),0_10px_28px_oklch(0.3_0.02_60_/_0.06)]">
        {rows.map((row, index) => (
          <button
            key={row.step}
            type="button"
            onClick={() => onJump(row.step)}
            className={`flex w-full items-center gap-3 px-4 py-3 text-left active:bg-foreground/[0.04] ${
              index < rows.length - 1 ? "border-b border-foreground/8" : ""
            }`}
          >
            <span className="w-[4.5rem] shrink-0 text-[13px] text-muted-foreground">{row.label}</span>
            <span className="min-w-0 flex-1 truncate text-[15px] font-medium">{row.value}</span>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground/50" aria-hidden />
          </button>
        ))}
      </div>
    </div>
  );
}
